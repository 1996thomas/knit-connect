// app/lib/carrierService.ts
import {
  CarrierService,
  CarrierServiceCreateResponse,
} from "app/types/products";
import { gql, GraphQLClient } from "graphql-request";

const apiVersion = process.env.API_VERSION || "2025-01";
const shop = process.env.KNIT_SHOP || "";
const token = process.env.KNIT_TOKEN || "";

const carrierServiceCreateMutation = gql`
  mutation CarrierServiceCreate($input: DeliveryCarrierServiceCreateInput!) {
    carrierServiceCreate(input: $input) {
      carrierService {
        id
        name
        callbackUrl
        active
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function registerCarrierService(): Promise<CarrierService | null> {
  const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;
  const client = new GraphQLClient(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });

  const callbackUrl = `${process.env.WEBSITE_URL}/api/cart/shipping-rates`;
  const variables = {
    input: {
      name: "Service d'Expédition Knit-Connect",
      callbackUrl,
      active: true,
      supportsServiceDiscovery: true,
    },
  };

  try {
    const response = await client.request<CarrierServiceCreateResponse>(
      carrierServiceCreateMutation,
      variables,
    );
    if (response.carrierServiceCreate.userErrors.length > 0) {
      console.error(
        "Erreur lors de l'enregistrement du Carrier Service :",
        response.carrierServiceCreate.userErrors,
      );
      return null;
    }
    return response.carrierServiceCreate.carrierService;
  } catch (error) {
    console.error("Erreur dans registerCarrierService :", error);
    return null;
  }
}
