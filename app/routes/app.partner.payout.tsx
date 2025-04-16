// PageComponent.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import PartnerPayoutCard from "app/components/Cards/partnerPayoutCard";
import { requirePartner } from "app/permissions.server";
import { authenticate } from "app/shopify.server";
import { Order } from "app/types/order";
import { OrderFromKnit } from "app/types/products";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { fetchOrder } from "../lib/fetch.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = process.env.WEBSITE_URL || "";
  const token = process.env.WEBSITE_TOKEN || "";
  const apiVersion = process.env.API_VERSION || "";
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  await requirePartner(request);
  const response = await fetch(`${url}/api/knit-connect/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop }),
  });
  const data = await response.json();
  const orders = await Promise.all(
    data.map(async (order: OrderFromKnit) => {
      const orderDetails = await fetchOrder(
        order.partner_order_id,
        shop,
        apiVersion,
        accessToken || "",
      );
      return { ...orderDetails, delivery_label: order.delivery_label };
    }),
  );
  return { orders, shop };
};

export default function PageComponent() {
  const { orders, shop } = useLoaderData<typeof loader>();
  const currentYear = new Date().getFullYear();
  const now = new Date();

  // Création de toutes les périodes (2 par mois pour 12 mois => 24 périodes)
  const yearRanges = [];
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(currentYear, month, 1);
    const monthEnd = endOfMonth(monthStart);

    // Première période : du 1er au 14 (jusqu'à 23h59:59)
    const firstRange = {
      start: monthStart,
      end: new Date(currentYear, month, 14, 23, 59, 59),
      label: `${format(monthStart, "MMM")} (1ère période)`,
    };

    // Deuxième période : du 15 à la fin du mois
    const secondRange = {
      start: new Date(currentYear, month, 15),
      end: monthEnd,
      label: `${format(monthStart, "MMM")} (2ème période)`,
    };

    yearRanges.push(firstRange, secondRange);
  }

  // Filtrer pour exclure les périodes futures. Ici, on prend celles dont la date de début est antérieure ou égale à aujourd'hui.
  const filteredRanges = yearRanges.filter((range) => range.start <= now);

  // (Les périodes sont déjà en ordre croissant depuis janvier.)
  const ordersGroupedByPeriod = filteredRanges.map((range) => ({
    range,
    orders: orders.filter((order) => {
      const orderDate = new Date(order.order.createdAt);
      return orderDate >= range.start && orderDate <= range.end;
    }),
  }));

  const reversedGrouped = ordersGroupedByPeriod.reverse();

  return (
    <Page title="Payouts for 2025" fullWidth>
      {reversedGrouped.map((group, index) => (
        <PartnerPayoutCard group={group} key={index} shop={shop}/>
      ))}
    </Page>
  );
}
