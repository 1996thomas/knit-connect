import { gql, GraphQLClient } from "graphql-request";

export async function retrieveCarrierService() {
  const apiVersion = process.env.API_VERSION || "2025-01";
  const shop = process.env.KNIT_SHOP || "";
  const token = process.env.KNIT_TOKEN || "";
  const expectedCallbackUrl = `${process.env.KNIT_URL}/api/cart/shipping-rates`;
  const carrierServiceRetrieveQuery = gql`
    query CarrierServiceList {
      carrierServices(first: 10, query: "active:true") {
        edges {
          node {
            id
            name
            callbackUrl
            active
            supportsServiceDiscovery
          }
        }
      }
    }
  `;
  const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

  const client = new GraphQLClient(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
  try {
    const response = await client.request<{
      carrierServices: {
        edges: {
          node: {
            id: string;
            name: string;
            callbackUrl: string;
            active: boolean;
            supportsServiceDiscovery: boolean;
          };
        }[];
      };
    }>(carrierServiceRetrieveQuery);

    const carrierServices = response.carrierServices.edges;
    const callbackSubstring = "/api/cart/shipping-rates";

    const matchingIds = carrierServices
      .filter((edge: any) => {
        const cbUrl = edge.node.callbackUrl;
        return (
          cbUrl &&
          cbUrl.includes(callbackSubstring) &&
          cbUrl !== expectedCallbackUrl
        );
      })
      .map((edge: any) => edge.node.id);
    return matchingIds;
  } catch (e) {
    console.error(e);
    return null;
  }
}
