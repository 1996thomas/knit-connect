import { useFetcher } from "@remix-run/react";
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
import { DeliveryIcon, ExternalIcon } from "@shopify/polaris-icons";
import { Order } from "app/types/order";
import { useCallback, useState, useEffect } from "react";
import PriorityBadge from "../Badges/priorityBadges";

export default function PartnerOrderCard({
  order,
  knitContact,
  store,
  isFromHome,
}: {
  order: Order;
  knitContact?: string;
  store: string;
  isFromHome?: boolean;
}) {
  const fetcher = useFetcher<{
    delivery_label?: {
      reservationNumber: string;
      pdfUrl: string;
      skybillNumber: string;
    };
  }>();

  const [checked, setChecked] = useState(false);
  const [localDeliveryLabel, setLocalDeliveryLabel] = useState(
    order.delivery_label,
  );
  const [open, setOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Toggle pour les détails de la commande
  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);
  // Toggle pour le collapsible du delivery label
  const handleDeliveryToggle = useCallback(
    () => setDeliveryOpen((prev) => !prev),
    [],
  );
  const handleChange = useCallback(
    (newChecked: boolean) => setChecked(newChecked),
    [],
  );

  const date = new Date(order.order.createdAt);

  // Mise à jour du state local dès que fetcher.data contient le nouveau delivery_label
  useEffect(() => {
    if (fetcher.data?.delivery_label) {
      setLocalDeliveryLabel(fetcher.data.delivery_label);
    }
  }, [fetcher.data]);

  const handleRequestLabel = () => {
    const formData = new FormData();
    formData.append("orderId", order.order.id);
    fetcher.submit(formData, { method: "post" });
    setChecked(false);
  };

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
          <Link
            target="_blank"
            url={`https://admin.shopify.com/store/${
              store.split(".myshopify.com")[0]
            }/orders/${order.order.id.split("gid://shopify/Order/")[1]}`}
          >
            <Button icon={ExternalIcon}>See order</Button>
          </Link>
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
        {isFromHome
          ? null
          : !localDeliveryLabel && (
              <InlineStack blockAlign="center" gap="200">
                <Checkbox
                  label="Ready to ship ?"
                  checked={checked}
                  onChange={handleChange}
                />
                <Button
                  onClick={handleRequestLabel}
                  size="slim"
                  disabled={!checked}
                  icon={DeliveryIcon}
                >
                  Request delivery label
                </Button>
              </InlineStack>
            )}
        {localDeliveryLabel && (
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
