import { gql, GraphQLClient } from "graphql-request";
const apiVersion = process.env.API_VERSION || "2025-01";
const shop = process.env.KNIT_SHOP || "";
const token = process.env.KNIT_TOKEN || "";

const carrierServiceUpdateMutation = gql`
  mutation CarrierServiceUpdate($input: DeliveryCarrierServiceUpdateInput!) {
    carrierServiceUpdate(input: $input) {
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

export async function updateCarrierService(carrierId: string) {
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
      id: carrierId,
      callbackUrl,
    },
  };
  try {
    interface CarrierServiceUpdateResponse {
      carrierServiceUpdate: {
        carrierService: {
          id: string;
          name: string;
          callbackUrl: string;
          active: boolean;
        };
        userErrors: { field: string; message: string }[];
      };
    }
    const response = await client.request<CarrierServiceUpdateResponse>(
      carrierServiceUpdateMutation,
      variables,
    );
    if (response.carrierServiceUpdate.userErrors.length > 0) {
      console.error(
        "Erreur lors de la mise à jour du Carrier Service :",
        response.carrierServiceUpdate.userErrors,
      );
      return null;
    }
    return response.carrierServiceUpdate.carrierService;
  } catch (error) {
    console.error("Erreur dans updateCarrierService :", error);
    return null;
  }
}
