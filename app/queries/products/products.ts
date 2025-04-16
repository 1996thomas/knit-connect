export const PRODUCTS_QUERY = `#graphql
query {
  products(first: 100) {
    edges {
      node {
        id
        title
        descriptionHtml
        handle
        productType
        vendor
        totalInventory
        createdAt
        updatedAt
        featuredMedia {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
        media(first: 10) {
          edges {
            node {
              mediaContentType
              alt
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
              ... on Video {
                sources {
                  url
                }
              }
              ... on Model3d {
                sources {
                  url
                }
              }
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price
              inventoryItem {
                id
                measurement {
                  weight {
                    value
                    unit
                  }
                }
                inventoryLevels(first: 10) {
                  edges {
                    node {
                    id
                    }
                  }
                }
              }
              sku
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        media(first: 10) {
          edges {
            node {
              id
              alt
            }
          }
        }
        tags
        metafields(first: 10) {
          edges {
            node {
              id
              namespace
              key
              value
              type
            }
          }
        }
        options {
          id
          name
          position
          values
        }
      }
    }
  }
}
`;

export const CREATE_PRODUCT = `#graphql
mutation CreateProduct($input: ProductCreateInput!) {
  productCreate(product: $input) {
    product {
      id
      title
      options {
        id
        name
        position
        optionValues {
          id
          name
          hasVariants
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const PRODUCT_VARIANTS_CREATE = `#graphql
mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      selectedOptions {
        name
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const UPDATE_PRODUCT_WITH_NEW_MEDIA = `#graphql
mutation UpdateProductWithNewMedia($media: [CreateMediaInput!]) {
  productUpdate(media: $media) {
    product {
      id
      media(first: 10) {
        nodes {
          alt
          mediaContentType
          preview {
            status
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;
