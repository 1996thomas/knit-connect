import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  BlockStack,
  Grid,
  InlineGrid,
  Button,
  Badge,
  InlineStack,
  Scrollable,
} from "@shopify/polaris";
import { InfoIcon, OrderIcon, ReceiptIcon } from "@shopify/polaris-icons";

import { authenticate } from "../shopify.server";
import { requirePartner } from "app/permissions.server";
import {
  fetchOrder,
  fetchProductFromDB,
  fetchShopProduct,
} from "../lib/fetch.server";
import { OrderFromKnit, Product } from "app/types/products";
import PartnerProductCard from "app/components/Cards/partnerProductCard";
import PartnerOrderCard from "app/components/Cards/partnerOrderCard";
import PartnerInfoCard from "app/components/Cards/partnerInformationCard";
import { createShopProductAction } from "app/lib/createShopProductAction";
import { decrypt } from "app/lib/encrypt";
import prisma from "../db.server";
import { useEffect, useState } from "react";
import { Order } from "app/types/order";
import getYearRanges from "app/lib/yearRanges";
import PartnerPayoutCard from "app/components/Cards/partnerPayoutCard";

const WEBSITE_URL = process.env.WEBSITE_URL || "";
const WEBSITE_TOKEN = process.env.WEBSITE_TOKEN || "";

export const loader: LoaderFunction = async ({ request }) => {
  await requirePartner(request);
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const apiVersion = process.env.API_VERSION || "";
  const knitContact = process.env.KNIT_CONTACT_MAIL || "t.reynaud@99knit.com";

  // Récupère le partenaire en base
  const partner = await prisma.partner.findUnique({ where: { shop } });
  if (!partner) {
    return json({
      matchedProducts: [] as Array<Product & { status?: string }>,
      knitContact,
      store: shop,
      filteredOrder: [] as Array<unknown>,
      pending: true,
      partnerFromKnit: null,
    });
  }

  // Appel à Knit pour récupérer les infos du partenaire
  const knitRes = await fetch(`${WEBSITE_URL}/api/knit-connect/get-partner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBSITE_TOKEN}`,
    },
    body: JSON.stringify({ shop }),
  });
  if (!knitRes.ok) throw new Response("Erreur Knit", { status: 502 });
  const partnerFromKnit = await knitRes.json();
  if (!partnerFromKnit || !partnerFromKnit?.existingPartner) {
    console.warn("Knit n'a pas renvoyé existingPartner", partnerFromKnit);
    return json({
      matchedProducts: [],
      knitContact,
      store: shop,
      filteredOrder: [],
      pending: true,
      partnerFromKnit: null,
    });
  }

  // Produits Shopify vs DB
  const token = decrypt(partner.accessToken || "");
  const { edges } = await fetchShopProduct(shop, token, apiVersion);
  const productsFromDB = await fetchProductFromDB(partner.id);

  // Combine en filtrant et protégeant status
  const matchedProducts: Array<Product & { status?: string }> = [];
  for (const product of edges) {
    const dbProd = productsFromDB.find((p) => p.id === product.node.id);
    if (!dbProd) continue;
    matchedProducts.push({
      ...product,
      status: dbProd.status ?? "UNKNOWN",
    });
  }
  matchedProducts.reverse();

  // Commandes Knit
  const ordersRes = await fetch(`${WEBSITE_URL}/api/knit-connect/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBSITE_TOKEN}`,
    },
    body: JSON.stringify({ shop }),
  });
  if (!ordersRes.ok) throw new Response("Erreur Orders", { status: 502 });
  const ordersJson = await ordersRes.json();
  const data: OrderFromKnit[] = Array.isArray(ordersJson)
    ? ordersJson
    : ordersJson.orders || [];

  const detailedOrders = (
    await Promise.all(
      data.map(async (ord) => {
        const details = await fetchOrder(
          ord.partner_order_id,
          shop,
          apiVersion,
          token,
        );
        return { ...details, delivery_label: ord.delivery_label };
      }),
    )
  ).filter((o) => o?.order?.id);

  const filteredOrder = detailedOrders.filter((o) => o.delivery_label === null);
  const payouts = partnerFromKnit.existingPartner.Payout;
  const orders = partnerFromKnit.existingPartner.Partner_Order;
  const totalAmount = detailedOrders.reduce(
    (acc: number, order: Order) =>
      acc + parseFloat(order.order.totalPriceSet.presentmentMoney.amount),
    0,
  );

  return json({
    matchedProducts,
    knitContact,
    store: shop,
    filteredOrder,
    pending: false,
    partnerFromKnit,
    payouts,
    orders,
    totalAmount,
  });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const product = await createShopProductAction(request);
    return json({ product });
  } catch (err: any) {
    console.error("Erreur création produit :", err);
    return json({ error: err.message }, { status: 400 });
  }
};

// Dérive le type JSON-friendly du loader
type LoaderData = SerializeFrom<typeof loader>;

export default function Dashboard() {
  const {
    matchedProducts,
    knitContact,
    store,
    filteredOrder,
    pending,
    partnerFromKnit,
    payouts,
    orders,
    totalAmount,
  } = useLoaderData<LoaderData>();

  const [productWarning, setProductWarning] = useState(false);

  useEffect(() => {
    // Pas d'annotation explicite : TS infère le bon type
    matchedProducts.forEach((product: Product) => {
      console.log(product.node.totalInventory)
      if (product.status === "PENDING" || product.node.totalInventory < 9) {
        setProductWarning(true);
      }
    });
  }, [matchedProducts]);
  const now = new Date();
  const yearRanges = getYearRanges();

  const filteredRanges = yearRanges.filter((range) => range.start <= now);

  const ordersGroupedByPeriod = filteredRanges.map((range) => {
    const ordersInPeriod = orders.filter((order) => {
      const date = new Date(order.createdAt);
      return date >= range.start && date <= range.end;
    });
    const payoutInfo = payouts.find(
      (p: { period: string }) => p.period === range.key,
    );
    return { range, orders: ordersInPeriod, payout: payoutInfo };
  });
  const reversedGrouped = ordersGroupedByPeriod.reverse();
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
          {/* — Products — */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Last products
                  </Text>
                  <InlineStack blockAlign="center" gap="100">
                    {productWarning && (
                      <Badge tone="warning" size="small">
                        Attention required
                      </Badge>
                    )}
                    <Button url="/app/partner/products" icon={InfoIcon}>
                      Check products
                    </Button>
                  </InlineStack>
                </InlineGrid>
                <Text as="p" variant="bodyMd">
                  This is the last products you added to Knit.
                </Text>
                <Scrollable
                  style={{ height: "320px" }}
                  scrollbarGutter="stable"
                >
                  <InlineGrid columns={{ lg: 2, xl: 2 }} gap="200">
                    {matchedProducts.slice(0, 8).map((item: Product) => (
                      <PartnerProductCard
                        key={item.node.id}
                        item={item}
                        knitContact={knitContact}
                        store={store}
                      />
                    ))}
                  </InlineGrid>
                </Scrollable>
              </BlockStack>
            </Card>
          </Grid.Cell>

          {/* — Orders — */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Last orders
                  </Text>
                  <Button url="/app/partner/orders" icon={OrderIcon}>
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
                    <Scrollable
                      style={{ height: "320px" }}
                      scrollbarGutter="stable"
                    >
                      {filteredOrder.slice(-4).map((order: Order) => (
                        <PartnerOrderCard
                          key={order.order.id}
                          //@ts-ignore
                          order={order}
                          knitContact={knitContact}
                          store={store}
                          isFromHome={true}
                        />
                      ))}
                    </Scrollable>
                  )}
                </InlineGrid>
              </BlockStack>
            </Card>
          </Grid.Cell>

          {/* — Payouts — */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Sales informations
                  </Text>
                </InlineGrid>
                <Text as="p" variant="bodyMd">
                  This is some sales informations from the begining of yout
                  partnership with Knit.
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }} gap="200">
                  <Card>
                    <div
                      style={{
                        aspectRatio: "1/1",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <Text variant="headingMd" as="h2">
                        Total orders
                      </Text>
                      <span
                        style={{
                          fontSize: "80px",
                          color: "lightgray",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontWeight: "bold",
                        }}
                      >
                        {orders.length}
                      </span>
                    </div>
                  </Card>
                  <Card>
                    <div
                      style={{
                        aspectRatio: "1/1",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <Text variant="headingMd" as="h2">
                        Total products
                      </Text>
                      <span
                        style={{
                          fontSize: "80px",
                          color: "lightgray",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontWeight: "bold",
                        }}
                      >
                        {matchedProducts.length}
                      </span>
                    </div>
                  </Card>
                  <Card>
                    <div
                      style={{
                        aspectRatio: "1/1",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <span style={{ zIndex: 2 }}>
                        <Text variant="headingMd" as="h2">
                          Total sales(€)
                        </Text>
                      </span>
                      <span
                        style={{
                          fontSize: "80px",
                          zIndex: 0,
                          color: "lightgray",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          fontWeight: "bold",
                        }}
                      >
                        {totalAmount.toFixed(0)}
                      </span>
                    </div>
                  </Card>
                </InlineGrid>
              </BlockStack>
            </Card>
          </Grid.Cell>
          {/* — Partner Info — */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <InlineGrid columns="1fr auto">
                  <Text as="h2" variant="headingXl">
                    Partnership informations
                  </Text>
                  <Button
                    url={`mailto:${knitContact}?subject=Modify account&body=Hello, it's ${partnerFromKnit.existingPartner.shop_name}, i want to modify some informations about my account`}
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
