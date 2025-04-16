import { Link, useSubmit } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  Collapsible,
  Form,
  Icon,
  InlineGrid,
  InlineStack,
  MediaCard,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import {
  CheckIcon,
  PlusCircleIcon,
  SelectIcon,
  SmileyHappyIcon,
  SmileyNeutralIcon,
} from "@shopify/polaris-icons";
import { Product } from "app/types/products";
import StockBadge from "../Badges/stockBadges";
import { useState } from "react";

interface AdminProductCardProps {
  product: Product;
  partnerData: any;
  toggleExpanded: (productId: string) => void;
  isExpanded: boolean;
  inventoryLevels: Record<string, any[]>;
  submit: ReturnType<typeof useSubmit>;
  isListed: boolean;
}

export default function AdminProductCard({
  product,
  partnerData,
  toggleExpanded,
  isExpanded,
  inventoryLevels,
  submit,
  isListed,
}: AdminProductCardProps) {
  const handleAdd = () => {
    const formData = new FormData();
    formData.append("productId", product.node.id);
    formData.append("partnerId", partnerData.id.toString());
    formData.append("intent", "add");
    submit(formData, { method: "post" });
  };

  return (
    <Card>
      <InlineGrid columns={["oneThird", "twoThirds"]}>
        <Thumbnail
          source={product.node.media.edges[0]?.node.image?.url || "/logo.png"}
          alt={product.node.media.edges[0]?.node.alt || ""}
        />
        <BlockStack align="space-between">
          <InlineStack wrap={false} blockAlign="start" align="space-between">
            <InlineStack blockAlign="start">
              <Text variant="bodyMd" as="p">
                {product.node.title}
              </Text>
            </InlineStack>
            <BlockStack inlineAlign="start" align="start">
              {isListed ? (
                product.status === "CONFIRMED" ? (
                  <Icon source={SmileyHappyIcon} tone="success" />
                ) : (
                  <Icon source={SmileyNeutralIcon} tone="warning" />
                )
              ) : (
                <Button
                  icon={PlusCircleIcon}
                  size="micro"
                  onClick={handleAdd}
                  accessibilityLabel="Add product on Knit"
                >
                  Add
                </Button>
              )}
            </BlockStack>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center" align="space-between">
            <Button
              icon={SelectIcon}
              size="micro"
              onClick={() => toggleExpanded(product.node.id)}
            >
              Variants
            </Button>
            <StockBadge availableQuantity={product.node.totalInventory} />
          </InlineStack>
        </BlockStack>
      </InlineGrid>
      <Collapsible open={isExpanded} id={`collapse-${product.node.id}`}>
        <div
          style={{
            maxHeight: "100px",
            marginTop: ".3rem",
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            gap: ".3rem",
          }}
        >
          {product.node.variants?.edges?.map((variant: any) => {
            const inventoryItemId = variant.node.inventoryItem.id;
            const levels = inventoryLevels[inventoryItemId];
            return (
              <div key={variant.node.id}>
                {levels && levels.length > 0 ? (
                  <InlineGrid columns={["twoThirds", "oneThird"]}>
                    <InlineGrid columns={["twoThirds", "oneThird"]}>
                      <Text variant="bodySm" as="p">
                        {variant.node.title}
                      </Text>
                      <Text variant="bodySm" as="p">
                        {variant.node.price}€
                      </Text>
                    </InlineGrid>
                    <StockBadge availableQuantity={levels[0]} />
                  </InlineGrid>
                ) : (
                  <span style={{ marginLeft: "1rem" }}>
                    {variant.node.title} — {variant.node.price}€ No inventory
                    available
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Collapsible>
    </Card>
  );
}
