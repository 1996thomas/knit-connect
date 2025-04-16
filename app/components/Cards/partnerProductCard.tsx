import { Link, useSubmit } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { Product } from "app/types/products";
import React from "react";
import StockBadge from "../Badges/stockBadges";
import {
  AlertTriangleIcon,
  ExternalIcon,
  EyeDropperIcon,
  PlusCircleIcon,
  RefreshIcon,
} from "@shopify/polaris-icons";

export default function PartnerProductCard({
  item,
  knitContact,
  store,
}: {
  item: Product;
  knitContact?: string;
  store: string;
}) {
  const submit = useSubmit();

  const generateProduct = (node: Product["node"]) =>
    submit(
      { node: JSON.stringify(node), action: "create" },
      { replace: true, method: "post" },
    );

  const updateProduct = (node: Product["node"]) =>
    submit(
      { node: JSON.stringify(node), action: "update" },
      { replace: true, method: "post" },
    );

  return (
    <BlockStack>
      <Card>
        <BlockStack gap={"200"}>
          <ButtonGroup variant="segmented" fullWidth gap="loose">
            {item.status === "CONFIRMED" ? (
              <Button
                size="micro"
                onClick={() => updateProduct(item.node)}
                accessibilityLabel="Edit product on Knit"
                icon={RefreshIcon}
              >
                Update
              </Button>
            ) : (
              <Button
                icon={PlusCircleIcon}
                size="micro"
                onClick={() => generateProduct(item.node)}
                accessibilityLabel="Add product on Knit"
              >
                Add
              </Button>
            )}
            <Button
              size="micro"
              url={`mailto:${knitContact}?subject=Problem with product : ${item.node.title} (ref : ${item.node.id})&body=Hello, it's ${item.node.vendor}, I have a problem with the product ${item.node.title} :`}
              accessibilityLabel="report a product problem"
              icon={AlertTriangleIcon}
            >
              Problem ?
            </Button>
            <Button
              size="micro"
              icon={ExternalIcon}
              target="_blank"
              url={`https://admin.shopify.com/store/${store.split(".myshopify.com")[0]}/products/${item.node.id.split("gid://shopify/Product/")[1]}`}
            >
              Check
            </Button>
          </ButtonGroup>

          <InlineGrid columns={["oneHalf", "oneHalf"]}>
            <InlineStack wrap={false} blockAlign="center" gap={"200"}>
              <Thumbnail
                source={
                  item.node.media.edges[0]?.node.image?.url || "/logo.png"
                }
                alt={item.node.media.edges[0]?.node.alt || ""}
              />
              <Text as="p" variant="bodySm">
                {item.node.title}
              </Text>
            </InlineStack>
            <InlineStack align="end" blockAlign="center" gap={"100"}>
              {item.status === "PENDING" ? (
                <Badge tone="warning">Pending</Badge>
              ) : item.status === "CONFIRMED" ? (
                <Badge tone="success">Listed</Badge>
              ) : (
                <Badge tone="critical">Refused</Badge>
              )}
              <StockBadge availableQuantity={item.node.totalInventory} />
            </InlineStack>
          </InlineGrid>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
