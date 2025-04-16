import {
  Badge,
  BlockStack,
  Button,
  Card,
  Checkbox,
  Collapsible,
  InlineStack,
  Link,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import PriorityBadge from "../Badges/priorityBadges";
import { ExternalIcon } from "@shopify/polaris-icons";
import { Order } from "app/types/order";

export default function AdminOrderCard({
  order,
  knitShop,
}: {
  order: Order;
  knitShop: string;
}) {
  const store = knitShop.split(".myshopify.com")[0];
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [localDeliveryLabel, _] = useState(order.delivery_label);
  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const date = new Date(order.order.createdAt);
  const handleDeliveryToggle = useCallback(
    () => setDeliveryOpen((prev) => !prev),
    [],
  );
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="100">
        <InlineStack blockAlign="center" align="space-between" gap="200">
          <InlineStack gap="100">
            <PriorityBadge
              createdAt={order.order.createdAt.toString()}
              delivered={!!localDeliveryLabel}
            />
            <Badge tone="magic" size="small">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Badge>
          </InlineStack>

          <Button
            target="_blank"
            url={`https://admin.shopify.com/store/${
              store
            }/orders/${order.original_order}`}
            icon={ExternalIcon}
          >
            See order
          </Button>
        </InlineStack>
        <InlineStack blockAlign="start" gap="200">
          <Text as="p" variant="bodyLg">
            Order {order.order.name}
          </Text>
        </InlineStack>
        <InlineStack gap="100">
          {order.order.lineItems.nodes.map((item: any) => (
            <BlockStack key={item.id}>
              <Thumbnail
                alt={item.image.altText}
                source={item.image.url}
                size="small"
              />
            </BlockStack>
          ))}
        </InlineStack>
        {localDeliveryLabel ? (
          <BlockStack>
            <Button
              onClick={handleDeliveryToggle}
              ariaControls="delivery-collapsible"
            >
              Delivery label
            </Button>
            <Collapsible open={deliveryOpen} id="delivery-collapsible">
              <Text variant="bodyMd" as="p">
                Tracking number : {localDeliveryLabel.skybillNumber}
              </Text>
              <Text variant="bodyMd" as="p">
                PDF Delivery Label Link :{" "}
                <Link url={localDeliveryLabel.pdfUrl} target="_blank">
                  Download link
                </Link>
              </Text>
            </Collapsible>
          </BlockStack>
        ) : (
          <Button disabled ariaControls="delivery-collapsible">
            Delivery label not available
          </Button>
        )}

        <Button onClick={handleToggle} ariaControls="order-collapsible">
          Order details
        </Button>
        <Collapsible open={open} id="order-collapsible">
          {order.order.lineItems.nodes.map((item: any) => (
            <Text as="p" variant="bodyMd" key={item.id}>
              {item.quantity}x {item.name}
            </Text>
          ))}
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
