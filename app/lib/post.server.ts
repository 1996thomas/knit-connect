import { Product, Variant } from "app/types/products";
import prisma from "../db.server";

export async function postProduct({
  productId,
  partnerId,
}: {
  productId: string;
  partnerId: string;
}) {
  return await prisma.product.create({
    data: {
      id: productId,
      partnerId: parseInt(partnerId),
      status: "PENDING",
    },
  });
}

export async function createShopProduct(
  adminShop: string,
  accessToken: string,
  apiVersion: string,
  node: Product["node"],
  shop: string,
  action: string,
) {
  const url = `https://${adminShop}/admin/api/${apiVersion}/graphql.json`;

  const mutation = `mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
    productSet(synchronous: $synchronous, input: $productSet) {
      product {
        id
        title
        vendor
        handle
        productType
        descriptionHtml 
        tags
      }
      productSetOperation {
        id
        status
        userErrors {
          code
          field
          message
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }`;

  const knitId = await prisma.product.findFirst({
    where: { id: node.id },
    select: { knitId: true },
  });
  const variables = {
    synchronous: true,
    productSet: {
      ...(action === "update" && { id: knitId?.knitId }),
      title: node.title,
      vendor: node.vendor,
      handle: node.handle,
      productType: node.productType,
      redirectNewHandle: true,
      descriptionHtml: node.descriptionHtml,
      tags: node.tags,
      productOptions: node.options.map((option) => ({
        name: option.name,
        position: option.position,
        values: option.values.map((value) => ({ name: value })),
      })),
      files: node.media.edges.map((edge) => ({
        alt: edge.node.alt,
        contentType: edge.mediaContentType,
        originalSource: edge.node.image.url || "",
      })),
      variants: node.variants.edges.map((edge) => ({
        optionValues: edge.node.selectedOptions.map((selected) => ({
          optionName: selected.name,
          name: selected.value,
        })),
        price: edge.node.price,
        sku: edge.node.sku,
        inventoryItem: {
          tracked: true,
        },
        metafields: [
          {
            namespace: "Original variant ID",
            key: "original_variant_id",
            value: edge.node.id,
            type: "single_line_text_field",
          },
          {
            namespace: "Shop",
            key: "shop",
            value: shop,
            type: "single_line_text_field",
          },
        ],
      })),
      metafields: [
        {
          namespace: "Original product ID",
          key: "original_product_id",
          value: node.id,
          type: "single_line_text_field",
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`Erreur GraphQL: ${JSON.stringify(result.errors)}`);
    }

    // Utiliser la bonne propriété 'productSet'
    const productSetResponse = result.data.productSet;

    if (
      productSetResponse.userErrors &&
      productSetResponse.userErrors.length > 0
    ) {
      throw new Error(
        `Erreur de validation: ${JSON.stringify(productSetResponse.userErrors)}`,
      );
    }

    await prisma.product.update({
      where: { id: node.id },
      data: { status: "CONFIRMED", knitId: productSetResponse.product.id },
    });

    return productSetResponse;
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    throw error;
  }
}
