import { Order } from "app/types/order";
import React from "react";
import AdminOrderCard from "../Cards/adminOrderCard";
import { BlockStack, InlineGrid, Text } from "@shopify/polaris";

export default function OrdersTabs({
  orders,
  knitShop,
}: {
  orders: Order[];
  knitShop: string;
}) {
  return (
    <BlockStack gap={"200"}>
      <Text variant="headingLg" as="h2">
        Orders
      </Text>
      <InlineGrid gap={"200"} columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}>
        {orders.map((order) => (
          <AdminOrderCard
            key={order.order.id}
            order={order}
            knitShop={knitShop}
          />
        ))}
      </InlineGrid>
    </BlockStack>
  );
}