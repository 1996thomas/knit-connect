import {
  Banner,
  BlockStack,
  Button,
  Collapsible,
  List,
  Text,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { format } from "date-fns";
import { Order } from "app/types/order";
import { useCallback, useState } from "react";
import {
  EmailIcon,
  ExternalIcon,
  EyeglassesIcon,
} from "@shopify/polaris-icons";

export default function PartnerPayoutCard({
  group,
  shop,
  knitContact,
  commissionRate,
}: {
  group: {
    payout: any;
    range: { start: Date; end: Date; label: string };
    orders: Order[];
  };
  shop: string;
  knitContact?: string;
  commissionRate: number;
}) {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const totalOrders = group.orders.length;
  const totalMoney = group.orders.reduce((acc, order) => {
    return acc + parseFloat(order.order.totalPriceSet.presentmentMoney.amount);
  }, 0);
  return (
    <Banner
      tone={
        group.orders.length > 0
          ? group.payout
            ? "success"
            : "warning"
          : "info"
      }
      title={`Period: ${group.range.label} from ${format(
        group.range.start,
        "dd MMM yyyy",
      )} to ${format(group.range.end, "dd MMM yyyy")}`}
    >
      {group.orders.length > 0 && (
        <Text variant="bodyMd" as="p">
          {`Total orders: ${totalOrders} – Total amount: €${totalMoney.toFixed(2)} - Total commission: €${(
            totalMoney *
            (commissionRate / 100)
          ).toFixed(2)} - Total payout: €${(
            totalMoney -
            totalMoney * (commissionRate / 100)
          ).toFixed(2)}`}
        </Text>
      )}
      {group.orders.length > 0 ? (
        <>
          <InlineStack gap="200" align="end">
            <Button
              onClick={handleToggle}
              ariaExpanded={open}
              ariaControls="basic-collapsible"
              icon={EyeglassesIcon}
            >
              See {totalOrders.toString()} orders
            </Button>
            <Button
              icon={EmailIcon}
              url={`mailto:${knitContact}?subject=Payout from ${shop}&body=Hello, I got a problem for the period ${group.range.label} from ${format(
                group.range.start,
                "dd MMM yyyy",
              )} to ${format(group.range.end, "dd MMM yyyy")}.`}
              ariaExpanded={open}
              ariaControls="basic-collapsible"
            >
              Contact support
            </Button>
            {group.payout && (
              <Button
                icon={ExternalIcon}
                url={group.payout.fileLink}
                target="_blank"
              >
                See payout
              </Button>
            )}
          </InlineStack>
          <Collapsible id="basic-collapsible" open={open}>
            <div style={{ marginTop: "1rem" }}></div>
            <BlockStack>
              {group.orders.map((order: Order) => (
                <>
                  <Link
                    key={order.order.id}
                    target="_blank"
                    url={`https://admin.shopify.com/store/${shop.split(".myshopify.com")[0]}/orders/${order.order.id.split("gid://shopify/Order/")[1]}`}
                  >
                    {" "}
                    {`Order ${order.order.name} – Total: €${order.order.totalPriceSet.presentmentMoney.amount} – Created on ${new Date(
                      order.order.createdAt,
                    ).toLocaleDateString()}`}
                  </Link>
                </>
              ))}
            </BlockStack>
          </Collapsible>
        </>
      ) : (
        <Text variant="bodyMd" as="p">
          No orders
        </Text>
      )}
    </Banner>
  );
}
