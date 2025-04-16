export const ORDER_QUERY = `#graphql
  query getOrder($orderId: ID!) {
    order(id: $orderId) {
      id
      createdAt
      name
      totalPriceSet {
        presentmentMoney {
          amount
        }
      }
      fulfillments(first: 10) {
      fulfillmentLineItems(first: 10) {
        edges {
          node {
            id}}}}
      lineItems(first: 10) {
        nodes {
          id
          name
          quantity
          image{
            url
          }
        }
      }
    }
  }
`;
