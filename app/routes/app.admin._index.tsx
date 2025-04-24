import type { LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Card, Divider, InlineGrid, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { fetchShopProduct } from "../lib/fetch.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const partners = await fetch(
    `${process.env.WEBSITE_URL}/api/knit-connect/get-partners`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBSITE_TOKEN}`,
      },
    },
  ).then((res) => res.json());

  const commissionRateAverage =
    partners.reduce(
      (acc: number, partner: any) => acc + parseFloat(partner.commissionRate),
      0,
    ) / partners.length;

  const products = await fetchShopProduct(
    session.shop,
    session.accessToken || "",
    process.env.SHOPIFY_API_VERSION || "",
  );

  const orders = await fetch(
    `${process.env.WEBSITE_URL}/api/knit-connect/orders-admin`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBSITE_TOKEN}`,
      },
    },
  ).then((res) => res.json());

  const pendingOrders = orders.filter((order: any) =>
    order.Partner_Order.find(
      (partner_order: any) => partner_order.delivery_label === null,
    ),
  );

  const last30daysorders = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const last30days = new Date(today.setDate(today.getDate() - 30));
    return orderDate >= last30days;
  });

  const last30daysOrdersCount = last30daysorders.length;
  const allOrdersCount = orders.length;

  const salesRevenue = orders.reduce((acc: number, order: any) => {
    const orderPrice = parseFloat(order.totalPrice);
    return acc + (isNaN(orderPrice) ? 0 : orderPrice);
  }, 0);

  return {
    partners,
    orders,
    pendingOrders,
    last30daysOrdersCount,
    allOrdersCount,
    salesRevenue,
    products,
    commissionRateAverage,
  };
};

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <div style={{ display: "flex", aspectRatio: "1/1", width: "100%" }}>
        <Text as="h2" variant="headingLg">
          {label}
          <span
            style={{
              transform: "translate(-50%, -50%)",
              color: "lightgray",
              fontSize: parseFloat(value.toString()) > 99 ? "130px" : "150px",
              position: "absolute",
              top: "50%",
              left: "50%",
              pointerEvents: "none",
            }}
          >
            {value}
          </span>
        </Text>
      </div>
    </Card>
  );
}

export default function Index() {
  const {
    partners = [],
    pendingOrders,
    last30daysOrdersCount,
    allOrdersCount,
    salesRevenue,
    products,
    commissionRateAverage,
  } = useLoaderData<typeof loader>();

  // Gestion des valeurs nulles/indéfinies avant l'utilisation de toFixed()
  const salesRevenueFormatted = salesRevenue ?? 0;
  const commissionRateFormatted = commissionRateAverage ?? 0;
  const last30daysOrdersFormatted = last30daysOrdersCount ?? 0;
  const allOrdersFormatted = allOrdersCount ?? 0;

  const commandStats = [
    { label: "Commands in progress", value: pendingOrders.length },
    { label: "Last 30 days", value: last30daysOrdersFormatted },
    { label: "All time", value: allOrdersFormatted },
  ];

  const moneyStats = [
    {
      label: "Total revenue sale (€)",
      value: `${salesRevenueFormatted.toFixed(0)}`,
    },
    {
      label: "Total commission (€)",
      value: `${(salesRevenueFormatted * (commissionRateFormatted / 100)).toFixed(0)}`,
    },
    {
      label: "Average commission (%)",
      value: `${commissionRateFormatted.toFixed(0)}`,
    },
  ];

  const generalStats = [
    { label: "Number of Partners", value: partners.length },
    { label: "Number of Products", value: products.edges.length },
  ];

  return (
    <>
      {partners.length > 0 ? (
        <BlockStack gap={"300"}>
          <Text as="h1" variant="headingXl">
            Overview
          </Text>
          <BlockStack gap={"400"}>
            <Text as="h2" variant="headingLg">
              Commands
            </Text>
            <InlineGrid
              columns={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 5 }}
              gap="300"
            >
              {commandStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </InlineGrid>
            <Divider />
            <Text as="h2" variant="headingLg">
              Sales
            </Text>
            <InlineGrid
              columns={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 5 }}
              gap="300"
            >
              {moneyStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </InlineGrid>
            <Divider />

            <Text as="h2" variant="headingLg">
              General
            </Text>
            <InlineGrid
              columns={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 5 }}
              gap="300"
            >
              {generalStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </InlineGrid>
          </BlockStack>
        </BlockStack>
      ) : (
        <Text variant="headingLg" as="h2">
          No information available
        </Text>
      )}
    </>
  );
}
