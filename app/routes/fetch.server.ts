import { ORDER_QUERY } from "app/queries/orders/orders";
import { PRODUCTS_QUERY } from "app/queries/products/products";

export async function fetchShopProduct(
  shop: string,
  accessToken: string,
  apiVersion: string,
) {
  const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
  const query = PRODUCTS_QUERY;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  // Si des erreurs sont présentes, loguez-les complètement
  if (result.errors && result.errors.length > 0) {
    console.error("GraphQL errors:", JSON.stringify(result.errors, null, 2));
    throw new Error("Erreur GraphQL lors de la récupération des produits");
  }

  if (!result.data) {
    console.error("Aucune donnée retournée:", JSON.stringify(result, null, 2));
    throw new Error("Erreur: aucune donnée retournée par Shopify");
  }

  return result.data.products;
}

export async function fetchPartners() {
  const partners = await prisma.partner.findMany();
  return partners;
}

export async function fetchPartner(shop: string) {
  const partner = await prisma.partner.findFirst({ where: { shop } });
  return partner;
}

export async function fetchProductFromDB(partnerId: number) {
  const product = await prisma.product.findMany({
    where: { partnerId },
  });
  return product;
}

export async function fetchOrder(
  orderId: string,
  shop: string,
  apiVersion: string,
  accessToken: string,
) {
  const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
  const variables = { orderId };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: ORDER_QUERY, variables }),
  });

  const result = await response.json();
  return result.data;
}

export async function fetchInventoryForItemServer({
  shopUrl,
  accessToken,
  inventoryItemId,
}: {
  shopUrl: string;
  accessToken: string;
  inventoryItemId: string;
}) {
  const apiVersion = process.env.API_VERSION || "2025-04";
  const endpoint = `https://${shopUrl}/admin/api/${apiVersion}/graphql.json`;

  const query = `#graphql
    query InventoryLevels($inventoryItemId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        inventoryLevels(first: 10) {
          edges {
            node {
              id
              location {
                id
                name
              }
              quantities(names: ["available", "committed", "incoming", "on_hand", "reserved"]) {
                name
                quantity
              }
            }
          }
        }
        variant {
          id
          title
          product {
            id
            title
          }
        }
      }
    }
  `;

  const variables = { inventoryItemId };

  // Appel direct à l’API Shopify
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching inventory for item ${inventoryItemId}: ${response.status}`,
    );
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Error in response: ${JSON.stringify(result.errors)}`);
  }

  const levels =
    result.data?.inventoryItem?.inventoryLevels?.edges.map((edge: any) => {
      const level = edge.node;
      const availableObj = level.quantities.find(
        (q: any) => q.name === "available",
      );
      return availableObj ? availableObj.quantity : 0;
    }) || [];

  return levels;
}
