import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  ActionList,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  InlineGrid,
  InlineStack,
  LegacyCard,
  List,
  Popover,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { CREATE_PRODUCT } from "app/queries/products/products";
import { authenticate } from "app/shopify.server";
import { Product } from "app/types/products";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(CREATE_PRODUCT);
  const responseJson = await response.json();
};

export default function AdminProductsTable({
  products,
}: {
  products: Product[];
}) {
  const fetcher = useFetcher<typeof action>();
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return products.map((product) => (
    <Card roundedAbove="sm">
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto">
          <InlineStack />
        </InlineGrid>
        <InlineStack align="space-between">
          <InlineStack blockAlign="center">
            {product.node.featuredImage && (
              <Thumbnail
                source={product.node.featuredImage.url}
                alt=""
                size="small"
              />
            )}
            <Text as="h4" variant="bodyMd">
              {product.node.title}
            </Text>
          </InlineStack>
          <InlineStack>
            <ButtonGroup>
              <Button onClick={generateProduct} accessibilityLabel="Preview">
                Ajouter à Knit
              </Button>
            </ButtonGroup>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  ));
}
