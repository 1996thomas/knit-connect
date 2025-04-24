import React, { useCallback, useState, useEffect } from "react";
import {
  BlockStack,
  Button,
  Collapsible,
  DropZone,
  Form,
  FormLayout,
  InlineStack,
  Text,
  Link,
  Badge,
  Divider,
  Icon,
} from "@shopify/polaris";
import { endOfMonth, format } from "date-fns";
import {
  AlertTriangleIcon,
  CashDollarFilledIcon,
  PayoutDollarIcon,
  PayoutIcon,
} from "@shopify/polaris-icons";
import { useFetcher } from "@remix-run/react";

interface PayoutPeriod {
  key: string;
  start: Date;
  end: Date;
  label: string;
}

interface OrderItem {
  original_order: any;
  delivery_label: string | null;
  order: {
    createdAt: string;
    id: string;
    name: string;
    totalPriceSet: { presentmentMoney: { amount: string } };
  };
}

interface PayoutTabsProps {
  orders: OrderItem[];
  payouts: {
    fileLink: string | undefined;
    id: string;
    amount: number;
    date: string;
    period: string;
  }[];
  knitShop: string;
  partner: string;
  commissionRate: number; // ex: 0.10 for 10%
}

export default function PayoutTabs({
  orders,
  payouts,
  knitShop,
  partner,
  commissionRate,
}: PayoutTabsProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const [formOpenPeriod, setFormOpenPeriod] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [base64File, setBase64File] = useState<string>("");
  const fetcher = useFetcher();

  useEffect(() => {
    setFile(null);
    setBase64File("");
  }, [formOpenPeriod]);

  const knitShopClean = knitShop.split(".")[0];

  const currentYear = new Date().getFullYear();
  const now = new Date();
  const periods: PayoutPeriod[] = [];
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(currentYear, month, 1);
    const monthKey = format(monthStart, "MMM").toUpperCase();
    periods.push(
      {
        key: `${monthKey}-01`,
        start: monthStart,
        end: new Date(currentYear, month, 14, 23, 59, 59),
        label: `${monthKey}-01 - ${format(monthStart, "MMMMMMMMM")} 1/2 period`,
      },
      {
        key: `${monthKey}-02`,
        start: new Date(currentYear, month, 15),
        end: endOfMonth(monthStart),
        label: `${monthKey}-02 - ${format(monthStart, "MMMMMMMMM")} 2/2 period`,
      },
    );
  }
  const validPeriods = periods.filter((p) => p.start <= now);

  const groupedOrders = validPeriods
    .map((period) => {
      const ordersInPeriod = orders.filter((o) => {
        const d = new Date(o.order.createdAt);
        return d >= period.start && d <= period.end;
      });
      const paidInfo = payouts.find((pay) => pay.period === period.key);
      return { period, orders: ordersInPeriod, paidInfo };
    })
    .reverse();

  const handleDrop = useCallback((_d: any, files: any[]) => {
    const f = files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = () =>
      setBase64File((reader.result as string).split(",")[1]);
    reader.readAsDataURL(f);
  }, []);

  const togglePeriod = useCallback((key: string) => {
    setExpandedPeriods((prev) => {
      const copy = new Set(prev);
      copy.has(key) ? copy.delete(key) : copy.add(key);
      return copy;
    });
  }, []);

  const handleSubmitFor = useCallback(
    (periodKey: string) => {
      if (!base64File) return;
      const formData = new FormData();
      formData.append("intent", "payout");
      formData.append("period", periodKey);
      formData.append("fileBase64", base64File);
      formData.append("partner", partner);
      fetcher.submit(formData, { method: "post" });

      setFile(null);
      setBase64File("");
    },
    [base64File, fetcher, partner],
  );

  return (
    <div style={{ padding: "1rem" }}>
      <BlockStack gap="200">
        <Text as="h2" variant="headingLg">
          Payout
        </Text>
        <Divider />

        <BlockStack gap="200">
          {groupedOrders.map(({ period, orders: ords, paidInfo }) => {
            const anyUnshipped = ords.some((o) => o.delivery_label === null);
            const totalAmount = ords.reduce(
              (sum, o) =>
                sum + parseFloat(o.order.totalPriceSet.presentmentMoney.amount),
              0,
            );
            
            const totalCommission = totalAmount * (commissionRate / 100);
            const netAmount = totalAmount - totalCommission;

            return (
              <BlockStack key={period.key} gap="100">
                <InlineStack align="space-between" gap={"200"}>
                  <InlineStack gap="100" blockAlign="center">
                    <Text as="h3" variant="headingMd">
                      {period.label}
                    </Text>
                    {ords.length === 0 ? (
                      <Badge size="small">No orders</Badge>
                    ) : paidInfo ? (
                      <Badge tone="success" size="small">
                        Paid
                      </Badge>
                    ) : (
                      <Badge icon={PayoutIcon} tone="info" size="small">
                        Not paid
                      </Badge>
                    )}
                    {anyUnshipped && (
                      <Icon source={AlertTriangleIcon} tone="warning" />
                    )}
                  </InlineStack>
                  <InlineStack gap="100">
                    {ords.length > 0 && (
                      <InlineStack gap="200" align="space-between">
                        <InlineStack gap={"100"}>
                          <Badge tone="info" size="small">
                            {` Total: €${totalAmount.toFixed(2)}`}
                          </Badge>
                          
                          <Badge tone="critical" size="small">
                            {`
                        Commission: %${commissionRate.toString()} - €${totalCommission.toFixed(2)}
                        `}
                          </Badge>
                          <Badge tone="success" size="small">
                            {`
                        Net: €${netAmount.toFixed(2)}
                        `}
                          </Badge>
                        </InlineStack>
                        <InlineStack gap="100">
                          <Button onClick={() => togglePeriod(period.key)}>
                            {expandedPeriods.has(period.key)
                              ? "Hide orders"
                              : "Show orders"}
                          </Button>
                          <Button
                            icon={
                              paidInfo ? CashDollarFilledIcon : PayoutDollarIcon
                            }
                            onClick={() =>
                              setFormOpenPeriod((prev) =>
                                prev === period.key ? null : period.key,
                              )
                            }
                          >
                            {formOpenPeriod === period.key
                              ? "Close"
                              : paidInfo
                                ? "Update Payout"
                                : "Create payout"}
                          </Button>
                        </InlineStack>
                      </InlineStack>
                    )}
                  </InlineStack>
                </InlineStack>
                <Divider />

                <Collapsible
                  id={period.key}
                  open={expandedPeriods.has(period.key)}
                >
                  <BlockStack gap={"100"}>
                    {ords.length === 0 ? (
                      <Text as="p" variant="bodyMd">
                        No orders in this period
                      </Text>
                    ) : (
                      ords.map((o) => (
                        <Link
                          key={o.order.id}
                          url={`https://admin.shopify.com/store/${knitShopClean}/orders/${o.original_order}`}
                          target="_blank"
                          removeUnderline
                        >
                          <Text as="p" variant="bodyMd">
                            Order {o.order.name} – €
                            {o.order.totalPriceSet.presentmentMoney.amount} –{" "}
                            {new Date(o.order.createdAt).toLocaleDateString()}{" "}
                            {!o.delivery_label && (
                              <Badge tone="warning" size="small">
                                Not shipped
                              </Badge>
                            )}
                          </Text>
                        </Link>
                      ))
                    )}
                  </BlockStack>
                </Collapsible>

                {formOpenPeriod === period.key && (
                  <InlineStack gap="100" align="end">
                    <Form onSubmit={() => handleSubmitFor(period.key)}>
                      <FormLayout>
                        <InlineStack gap="200" blockAlign="center">
                          {paidInfo && (
                            <Link
                              removeUnderline
                              target="_blank"
                              url={paidInfo.fileLink}
                            >
                              <Text as="p" variant="bodyMd">
                                {`${
                                  paidInfo.fileLink
                                    ?.split("/invoice/")[1]
                                    .split(".com")[0]
                                }.pdf`}
                              </Text>
                            </Link>
                          )}
                          {file && (
                            <Text as="p" variant="bodyMd">
                              {file.name}
                            </Text>
                          )}
                          <div style={{ width: "40px", height: "40px" }}>
                            <DropZone onDrop={handleDrop} accept=".pdf">
                              <DropZone.FileUpload />
                            </DropZone>
                          </div>
                          <Button submit disabled={!base64File}>
                            Save
                          </Button>
                        </InlineStack>
                      </FormLayout>
                    </Form>
                  </InlineStack>
                )}
              </BlockStack>
            );
          })}
        </BlockStack>
      </BlockStack>
    </div>
  );
}
