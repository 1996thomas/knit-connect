import { BlockStack, Divider, InlineGrid, Text } from "@shopify/polaris";
import React, { useState } from "react";
import AdminProductCard from "../Cards/adminProductCard";
import { Product } from "app/types/products";
import { useSubmit } from "@remix-run/react";

export default function ProductsTabs({
  existingProducts,
  newProducts,
  partner,
  inventoryLevels,
}: {
  existingProducts: Product[];
  newProducts: Product[];
  partner: {
    partnerData: any;
    partnerFromKnit?: { shop_name?: string };
  };
  inventoryLevels: Record<string, any>;
}) {
  const submit = useSubmit();
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});
  const toggleExpanded = (id: string) => {
    setExpandedProducts((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  return (
    <BlockStack gap={"500"}>
      <BlockStack gap={"200"}>
        <Text variant="headingLg" as="h2">
          Listed on Knit
        </Text>
        <InlineGrid gap={"200"} columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 5 }}>
          {existingProducts.map((item: Product & { status: string }) => (
            <AdminProductCard
              isListed={true}
              key={item.node.id}
              product={item}
              partnerData={partner.partnerData}
              toggleExpanded={toggleExpanded}
              isExpanded={expandedProducts[item.node.id] || false}
              inventoryLevels={inventoryLevels}
              submit={submit}
            />
          ))}
        </InlineGrid>
      </BlockStack>
      <Divider borderColor="border" borderWidth="050" />
      <BlockStack gap={"200"}>
        {newProducts.length > 0 && (
          <Text variant="headingLg" as="h2">
            Available on {partner.partnerFromKnit?.shop_name || "Shop"}
          </Text>
        )}
        <InlineGrid gap={"200"} columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 5 }}>
          {newProducts.map((item: Product) => (
            <AdminProductCard
              isListed={false}
              key={item.node.id}
              product={item}
              partnerData={partner.partnerData}
              toggleExpanded={toggleExpanded}
              isExpanded={expandedProducts[item.node.id] || false}
              inventoryLevels={inventoryLevels}
              submit={submit}
            />
          ))}
        </InlineGrid>
      </BlockStack>
    </BlockStack>
  );
}
