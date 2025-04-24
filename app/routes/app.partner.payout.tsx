// PageComponent.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, InlineGrid, Page } from "@shopify/polaris";
import PartnerPayoutCard from "app/components/Cards/partnerPayoutCard";
import { requirePartner } from "app/permissions.server";
import { authenticate } from "app/shopify.server";
import { Order } from "app/types/order";
import { OrderFromKnit } from "app/types/products";
import { startOfMonth, endOfMonth, format, getYear } from "date-fns";
import { fetchOrder } from "../lib/fetch.server";
import getYearRanges from "app/lib/yearRanges";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = process.env.WEBSITE_URL || "";
  const token = process.env.WEBSITE_TOKEN || "";
  const apiVersion = process.env.API_VERSION || "";
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  const knitContact = process.env.KNIT_CONTACT_MAIL;
  await requirePartner(request);
  const response = await fetch(`${url}/api/knit-connect/get-partner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop }),
  });
  const data = await response.json();
  const orders = await Promise.all(
    data.existingPartner.Partner_Order.map(async (order: OrderFromKnit) => {
      const orderDetails = await fetchOrder(
        order.partner_order_id,
        shop,
        apiVersion,
        accessToken || "",
      );
      return { ...orderDetails, delivery_label: order.delivery_label };
    }),
  );
  const payouts = data.existingPartner.Payout;
  return {
    orders,
    shop,
    knitContact,
    payouts,
    commissionRate: data.existingPartner.commissionRate,
  };
};

export default function PageComponent() {
  const { orders, shop, knitContact, payouts, commissionRate } =
    useLoaderData<typeof loader>();
  const now = new Date();
  const yearRanges = getYearRanges();

  const filteredRanges = yearRanges.filter((range) => range.start <= now);

  const ordersGroupedByPeriod = filteredRanges.map((range) => {
    const ordersInPeriod = orders.filter((order) => {
      const date = new Date(order.order.createdAt);
      return date >= range.start && date <= range.end;
    });
    const payoutInfo = payouts.find(
      (p: { period: string }) => p.period === range.key,
    );
    return { range, orders: ordersInPeriod, payout: payoutInfo };
  });
  const reversedGrouped = ordersGroupedByPeriod.reverse();

  return (
    <Page title="Payouts for 2025" fullWidth>
      <BlockStack>
        {reversedGrouped.map((group, index) => (
          <PartnerPayoutCard
            group={group}
            key={index}
            shop={shop}
            knitContact={knitContact}
            commissionRate={commissionRate}
          />
        ))}
      </BlockStack>
    </Page>
  );
}
