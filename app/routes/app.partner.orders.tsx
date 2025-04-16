// app/routes/orders.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Card,
  Page,
  ResourceList,
  Text,
  Collapsible,
  Button,
  ResourceItem,
  BlockStack,
  InlineGrid,
} from "@shopify/polaris";
import { requirePartner } from "app/permissions.server";
import { authenticate } from "app/shopify.server";
import { fetchOrder } from "./fetch.server";
import { useState } from "react";
import type { OrderFromKnit } from "app/types/products";
import PartnerOrderCard from "app/components/Cards/partnerOrderCard";

const url = process.env.WEBSITE_URL || "";
const token = process.env.WEBSITE_TOKEN || "";
const apiVersion = process.env.API_VERSION || "";

// Loader pour récupérer les commandes
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePartner(request);
  const { session } = await authenticate.admin(request);
  const knitContact = process.env.KNIT_CONTACT_MAIL || "t.reynaud@99knit.com";
  const { shop, accessToken } = session;

  const response = await fetch(`${url}/api/knit-connect/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop }),
  });

  
  const data: OrderFromKnit[] = await response.json();
  const orders = (
    await Promise.all(
      data.map(async (order: OrderFromKnit) => {
        const orderDetails = await fetchOrder(
          order.partner_order_id,
          shop,
          apiVersion,
          accessToken || "",
        );
        return { ...orderDetails, delivery_label: order.delivery_label };
      }),
    )
  ).filter((order) => order && order.order && order.order.id);

  return { orders, knitContact, store: shop };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requirePartner(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId");

  if (!orderId || typeof orderId !== "string") {
    return new Response("orderId is required", { status: 400 });
  }

  const apiResponse = await fetch(
    `${url}/api/knit-connect/request-delivery-label`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    },
  );

  const result = await apiResponse.json();
  if (!result || !result.delivery_label) {
    return new Response("Error fetching delivery label", { status: 500 });
  }
  const { delivery_label } = result;

  return { delivery_label };
};

export default function OrdersPage() {
  const { orders, knitContact, store } = useLoaderData<typeof loader>();
  return (
    <Page title="Orders" fullWidth>
      <InlineGrid gap={"200"} columns={3}>
        {orders.slice().map((order) => (
          <PartnerOrderCard
            key={order.order.id}
            order={order}
            knitContact={knitContact}
            store={store}
          />
        ))}
      </InlineGrid>
    </Page>
  );
}
