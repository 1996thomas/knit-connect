import { useCallback, useState } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  InlineGrid,
  InlineStack,
  BlockStack,
  Text,
  Tabs,
} from "@shopify/polaris";
import {
  fetchInventoryForItemServer,
  fetchOrder,
  fetchPartner,
  fetchProductFromDB,
  fetchShopProduct,
} from "../lib/fetch.server";
import { OrderFromKnit, Product } from "app/types/products";
import { decrypt } from "app/lib/encrypt";
import { EmailIcon, PhoneIcon } from "@shopify/polaris-icons";
import ProductsTabs from "app/components/Tabs/productsTabs";
import OrdersTabs from "app/components/Tabs/ordersTabs";
import AdminInfoCard from "app/components/Cards/adminInformationCard";
import prisma from "../db.server";
import PayoutTabs from "app/components/Tabs/payoutTabs";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const apiVersion = process.env.API_VERSION || "";
  const url = process.env.WEBSITE_URL || "";
  const token = process.env.WEBSITE_TOKEN || "";
  const shop = process.env.KNIT_SHOP || "";
  const { partner } = params;
  const partnerData = await fetchPartner(partner || "");
  if (!partnerData?.accessToken) {
    return null;
  }
  const response = await fetch(
    `${process.env.WEBSITE_URL}/api/knit-connect/get-partner`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBSITE_TOKEN}`,
      },
      body: JSON.stringify({ shop: partnerData.shop }),
    },
  );
  const partnerFromKnit = await response.json();

  const decryptedAccessToken = decrypt(partnerData?.accessToken);
  const products = await fetchShopProduct(
    partnerData?.shop || "",
    decryptedAccessToken || "",
    apiVersion,
  );

  const productFromDB = await fetchProductFromDB(partnerData?.id || 0);
  const inventoryItemIds = new Set<string>();
  for (const productEdge of products.edges) {
    const variantsEdges = productEdge.node.variants.edges;
    for (const variant of variantsEdges) {
      const inventoryItemId = variant.node.inventoryItem.id;
      inventoryItemIds.add(inventoryItemId);
    }
  }

  const uniqueInventoryItemIds = Array.from(inventoryItemIds);

  // Lancer en parallèle la récupération des niveaux d'inventaire
  const inventoryLevelsArray = await Promise.all(
    uniqueInventoryItemIds.map(async (inventoryItemId) => {
      try {
        const levels = await fetchInventoryForItemServer({
          shopUrl: partnerData.shop,
          accessToken: decryptedAccessToken,
          inventoryItemId,
        });
        return { inventoryItemId, levels };
      } catch (error) {
        console.error(
          `Error fetching inventory for ${inventoryItemId}:`,
          error,
        );
        return { inventoryItemId, levels: [] };
      }
    }),
  );
  const inventoryLevels: Record<string, any[]> = {};
  inventoryLevelsArray.forEach(({ inventoryItemId, levels }) => {
    inventoryLevels[inventoryItemId] = levels;
  });

  const d = decrypt(partnerData.accessToken);
  const data = partnerFromKnit.existingPartner.Partner_Order || [];
  const orders = (
    await Promise.all(
      data.map(async (order: OrderFromKnit) => {
        const orderDetails = await fetchOrder(
          order.partner_order_id,
          partnerData.shop,
          apiVersion,
          d || "",
        );
        return {
          ...orderDetails,
          delivery_label: order.delivery_label,
          original_order: order.original_order,
        };
      }),
    )
  ).filter((order) => order && order.order && order.order.id);
  const payouts = partnerFromKnit.existingPartner.Payout || [];
  return {
    partner: { partnerData, partnerFromKnit },
    products,
    productFromDB,
    inventoryLevels,
    orders,
    payouts,
    knitShop: shop,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const productId = formData.get("productId") as string;
  const partnerId = formData.get("partnerId") as string;
  const period = formData.get("period") as string;
  const fileBase64 = formData.get("fileBase64") as string;
  const partner = formData.get("partner") as string;

  if (intent === "payout") {
    if (!fileBase64 || !period) {
      return {
        error: "Need a file and a period",
        status: 400,
      };
    }
    console.log(partner);
    await fetch(`${process.env.WEBSITE_URL}/api/knit-connect/payout-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBSITE_TOKEN}`,
      },
      body: JSON.stringify({
        shop: partner,
        fileBase64,
        period,
      }),
    });
  }

  if (intent === "delete") {
    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, partnerId: parseInt(partnerId, 10) },
    });
    if (!existingProduct) {
      return {
        error: "Ce produit n'est pas associé à ce partenaire",
        status: 400,
      };
    }
    await prisma.product.delete({
      where: { id: productId },
    });
    return { deleted: productId };
  }
  if (intent === "add") {
    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, partnerId: parseInt(partnerId, 10) },
    });
    if (existingProduct) {
      return {
        error: "Ce produit est déjà associé à ce partenaire",
        status: 400,
      };
    }
    const newProduct = await prisma.product.create({
      data: {
        id: productId,
        partnerId: parseInt(partnerId, 10),
        status: "PENDING",
      },
    });
    return { newProduct };
  } else if (intent !== "payout" && intent !== "delete" && intent !== "add") {
    console.log(intent, "This intent is not supported");
    return {
      error: "This intent is not supported",
      status: 400,
    };
  }
  return null;
};

export default function PartnerProducts() {
  const loaderData = useLoaderData<typeof loader>();
  const partner = loaderData?.partner || {
    partnerData: {
      shop: "",
      accessToken: "",
      id: 0,
    },
    partnerFromKnit: {
      shop_url: "",
      shop_name: "",
    },
  };
  const knitShop = loaderData?.knitShop || "";
  const orders = loaderData?.orders;
  const products = loaderData?.products || { edges: [] };
  const productFromDB = loaderData?.productFromDB || [];
  const inventoryLevels = loaderData?.inventoryLevels || {};
  const payouts = loaderData?.payouts || [];
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const existingProducts = products.edges
    .map((product: Product) => {
      const dbProduct = productFromDB.find((p) => p.id === product.node.id);
      if (dbProduct) {
        return { ...product, status: dbProduct.status };
      }
      return null;
    })
    .filter(
      (product: Product): product is Product & { status: string } =>
        product !== null,
    );

  const newProducts = products.edges.filter(
    (product: Product) => !productFromDB.some((p) => p.id === product.node.id),
  );

  const tabs = [
    {
      id: "products",
      content: "Products",
      accessibilityLabel: "All products",
      panelID: "products-content-1",
    },
    {
      id: "orders",
      content: "Orders",
      panelID: "orders-content-1",
      accessibilityLabel: "All orders",
    },
    {
      id: "payouts",
      content: "Payouts",
      panelID: "payouts-content-1",
    },
    {
      id: "informations",
      content: "Informations",
      panelID: "informations-content-1",
      accessibilityLabel: "All informations",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <Page
        fullWidth
        title={partner.partnerFromKnit?.existingPartner.shop_name || "Shop"}
        secondaryActions={[
          {
            icon: EmailIcon,
            content: "Contact partner",
            url: `mailto:${partner.partnerFromKnit?.existingPartner.email}`,
            accessibilityLabel: "Contact partner",
          },
        ]}
        subtitle={`${partner.partnerFromKnit?.existingPartner.shop_url}`}
      >
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Page fullWidth>
            {selected === 0 && (
              <ProductsTabs
                existingProducts={existingProducts}
                newProducts={newProducts}
                partner={partner}
                inventoryLevels={inventoryLevels}
              />
            )}
            {selected === 1 && (
              <OrdersTabs orders={orders || []} knitShop={knitShop} />
            )}
            {selected === 2 && (
              <Text variant="headingLg" as="h2">
                <PayoutTabs
                  orders={orders || []}
                  payouts={payouts || []}
                  knitShop={knitShop}
                  commissionRate={
                    partner.partnerFromKnit.existingPartner.commissionRate
                  }
                  partner={
                    partner.partnerFromKnit.existingPartner.shop_url || ""
                  }
                />
              </Text>
            )}
            {selected === 3 && (
              <BlockStack gap={"200"}>
                <InlineStack gap={"200"}>
                  <Text variant="headingLg" as="h2">
                    Informations
                  </Text>
                </InlineStack>
                <InlineGrid columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 3 }}>
                  <AdminInfoCard
                    info={partner.partnerFromKnit.existingPartner}
                  />
                </InlineGrid>
              </BlockStack>
            )}
          </Page>
        </Tabs>
      </Page>
    </div>
  );
}
