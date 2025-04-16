import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Text,
  Card,
  BlockStack,
  Grid,
  InlineGrid,
  Button,
  ResourceList,
  Badge,
  Icon,
  InlineStack,
  Scrollable,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { requirePartner } from "app/permissions.server";
import {
  AlertTriangleIcon,
  InfoIcon,
  OrderIcon,
  PlusCircleIcon,
  ProductAddIcon,
  ReceiptIcon,
} from "@shopify/polaris-icons";
import {
  fetchOrder,
  fetchProductFromDB,
  fetchShopProduct,
} from "../lib/fetch.server";
import { OrderFromKnit, Product } from "app/types/products";
import { useLoaderData } from "@remix-run/react";
import { match } from "assert";
import PartnerProductCard from "app/components/Cards/partnerProductCard";
import { useEffect, useState } from "react";
import { createShopProductAction } from "app/lib/createShopProductAction";
import PartnerOrderCard from "app/components/Cards/partnerOrderCard";
import { Order } from "app/types/order";
import { decrypt, encrypt } from "app/lib/encrypt";
import PartnerInfoCard from "app/components/Cards/partnerInformationCard";

const url = process.env.WEBSITE_URL || "";
const token = process.env.WEBSITE_TOKEN || "";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePartner(request);
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  const apiVersion = process.env.API_VERSION || "";
  const knitContact = process.env.KNIT_CONTACT_MAIL || "t.reynaud@99knit.com";

  const partner = await prisma.partner.findUnique({ where: { shop } });
  if (!partner) {
    return {
      matchedProducts: [],
      knitContact,
      store: shop,
      filteredOrder: [],
      pending: true,
      partnerFromKnit: null,
    };
  }

  const knitResponse = await fetch(`${url}/api/knit-connect/get-partner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop }),
  });

  const partnerFromKnit = await knitResponse.json();

  const decryptedAccessToken = decrypt(partner.accessToken || "");
  const { edges } = await fetchShopProduct(
    partner.shop,
    decryptedAccessToken || "",
    apiVersion,
  );

  const productsFromDB = await fetchProductFromDB(partner.id);
  const dbProductIds = new Set(productsFromDB.map((p) => p.id));

  const matchedProducts = edges
    .filter((product: Product) => dbProductIds.has(product.node.id))
    .map((product: Product) => {
      const dbProduct = productsFromDB.find((p) => p.id === product.node.id);
      return { ...product, status: dbProduct?.status };
    });
  matchedProducts.reverse();

  const response = await fetch(`${url}/api/knit-connect/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop }),
  });

  const responseJson = await response.json();
  const data: OrderFromKnit[] = Array.isArray(responseJson)
    ? responseJson
    : responseJson.orders || [];

  const orders: Order[] = (
    await Promise.all(
      data.map(async (order: OrderFromKnit) => {
        const orderDetails = await fetchOrder(
          order.partner_order_id,
          shop,
          apiVersion,
          decryptedAccessToken || "",
        );
        return { ...orderDetails, delivery_label: order.delivery_label };
      }),
    )
  ).filter((order) => order && order.order && order.order.id);

  const filteredOrder = orders.filter((order) => order.delivery_label === null);
  return {
    matchedProducts,
    knitContact,
    store: partner.shop,
    filteredOrder,
    pending: false,
    partnerFromKnit,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const product = await createShopProductAction(request);
    return { product };
  } catch (error: any) {
    console.error("Erreur lors de la création du produit :", error);
    return { error: error.message, status: 400 };
  }
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const {
    pending,
    matchedProducts = [],
    knitContact = "",
    store = "",
    filteredOrder = [],
    partnerFromKnit,
  } = loaderData || {};
  const [productWarning, setProductWarning] = useState(false);

  useEffect(() => {
    matchedProducts.forEach((product: Product) => {
      if (product.status === "PENDING" || product.node.totalInventory > 5) {
        setProductWarning(true);
      }
    });
  }, []);
  return (
    <Page title="Dashboard" fullWidth>
      {pending ? (
        <Card>
          <Text variant="headingXl" as="h2">
            Your account is pending
          </Text>
          <Text variant="bodyMd" as="p">
            Your account is pending, please contact us at {knitContact}
          </Text>
        </Card>
      ) : (
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Last products
                  </Text>
                  <InlineStack blockAlign="center" gap="100">
                    {productWarning ? (
                      <Badge tone="warning" size="small">
                        Attention required
                      </Badge>
                    ) : null}
                    <Button
                      url="/app/partner/products"
                      onClick={() => {}}
                      accessibilityLabel="Check products"
                      icon={ProductAddIcon}
                    >
                      Check products
                    </Button>
                  </InlineStack>
                </InlineGrid>
                <Text as="p" variant="bodyMd">
                  This is the last products you added to Knit.
                </Text>
                <Grid.Cell>
                  <InlineGrid columns={{ md: 1, lg: 2, xl: 2 }} gap="200">
                    {matchedProducts.slice(0, 4).map((item: Product) => (
                      <PartnerProductCard
                        key={item.node.id}
                        item={item}
                        knitContact={knitContact}
                        store={store}
                      />
                    ))}
                  </InlineGrid>
                </Grid.Cell>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
            <Card roundedAbove="sm">
              <InlineGrid columns="1fr auto">
                <Text as="h2" variant="headingXl">
                  Last orders
                </Text>
                <Button
                  url="/app/partner/orders"
                  onClick={() => {}}
                  accessibilityLabel="Check Orders"
                  icon={OrderIcon}
                >
                  Check orders
                </Button>
              </InlineGrid>
              <Text as="p" variant="bodyMd">
                This is the last orders you got from Knit.
              </Text>
              <InlineGrid columns="1fr" gap="200">
                {filteredOrder.length === 0 ? (
                  <Text variant="bodyMd" as="p">
                    No orders to display
                  </Text>
                ) : (
                  filteredOrder.reverse().map((order) => (
                    <PartnerOrderCard
                      key={order.order.id}
                      //@ts-ignore
                      order={order}
                      knitContact={knitContact}
                      store={store}
                    />
                  ))
                )}
              </InlineGrid>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Last payouts
                  </Text>
                  <Button
                    url="/app/partner/payout"
                    onClick={() => {}}
                    accessibilityLabel="Add variant"
                    icon={ReceiptIcon}
                  >
                    Check payouts
                  </Button>
                </InlineGrid>
                <Text as="p" variant="bodyMd">
                  This is the last payouts you got from Knit.
                </Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Informations
                  </Text>
                  <Button
                    url={`mailto:${knitContact}?subject=I want to modify my informations on Knit&body=Hello, It's ${partnerFromKnit.existingPartner.shop_name}  on Knit and I want to modify my informations :`}
                    target="_blank"
                    size="slim"
                    onClick={() => {}}
                    accessibilityLabel="Contact us"
                    icon={InfoIcon}
                  >
                    Modify informations
                  </Button>
                </InlineGrid>
                <Text as="p" variant="bodyMd">
                  This is the informations about your account. You have to
                  contact us to modify them.
                </Text>
                <PartnerInfoCard info={partnerFromKnit} />
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>
      )}
    </Page>
  );
}
