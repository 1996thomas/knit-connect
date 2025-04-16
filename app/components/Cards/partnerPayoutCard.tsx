import {
  Banner,
  BlockStack,
  Button,
  Collapsible,
  List,
  Text,
  Link,
} from "@shopify/polaris";
import { format } from "date-fns";
import { Order } from "app/types/order";
import { useCallback, useState } from "react";

export default function PartnerPayoutCard({
  group,
  shop,
}: {
  group: { range: { start: Date; end: Date; label: string }; orders: Order[] };
  shop: string;
}) {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const totalOrders = group.orders.length;
  const totalMoney = group.orders.reduce((acc, order) => {
    return acc + parseFloat(order.order.totalPriceSet.presentmentMoney.amount);
  }, 0);

  return (
    <Banner
    
      tone={group.orders.length > 0 ? "success" : "info"}
      title={`Period: ${group.range.label} from ${format(
        group.range.start,
        "dd MMM yyyy",
      )} to ${format(group.range.end, "dd MMM yyyy")}`}
    >
      <Text variant="bodyMd" as="p">
        {`Total orders: ${totalOrders} – Total amount: €${totalMoney.toFixed(2)}`}
      </Text>

      {group.orders.length > 0 ? (
        <>
          <Button
            onClick={handleToggle}
            ariaExpanded={open}
            ariaControls="basic-collapsible"
          >
            See {totalOrders.toString()} orders
          </Button>
          <Collapsible
            id="basic-collapsible"
            open={open}
          >
          <BlockStack >
              {group.orders.map((order: Order) => (
                <Link
                  key={order.order.id}
                  target="_blank"
                  url={`https://admin.shopify.com/store/${
                    shop.split(".myshopify.com")[0]
                  }/orders/${order.order.id.split("gid://shopify/Order/")[1]}`}
                >
                  {" "}
                  {`Order ${order.order.name} – Total: €${order.order.totalPriceSet.presentmentMoney.amount} – Created on ${new Date(
                    order.order.createdAt,
                  ).toLocaleDateString()}`}
                </Link>
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
