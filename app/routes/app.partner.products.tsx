import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, InlineGrid, Page, Text } from "@shopify/polaris";
import { requirePartner } from "app/permissions.server";
import { authenticate } from "app/shopify.server";
import { Product } from "app/types/products";
import { fetchProductFromDB, fetchShopProduct } from "../lib/fetch.server";
import PartnerProductCard from "app/components/Cards/partnerProductCard";
import prisma from "../db.server";
import { createShopProductAction } from "app/lib/createShopProductAction";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePartner(request);
  const knitContact = process.env.KNIT_CONTACT_MAIL || "t.reynaud@99knit.com";
  const apiVersion = process.env.API_VERSION || "";
  const { session } = await authenticate.admin(request);
  const shop = await prisma.partner.findUnique({
    where: { shop: session.shop },
  });

  if (!shop) {
    return;
  }

  const { edges } = await fetchShopProduct(
    session.shop,
    session.accessToken || "",
    apiVersion,
  );

  const productsFromDB = await fetchProductFromDB(shop.id);
  const dbProductIds = new Set(productsFromDB.map((p) => p.id));

  const matchedProducts = edges
    .filter((product: Product) => dbProductIds.has(product.node.id))
    .map((product: Product) => {
      const dbProduct = productsFromDB.find((p) => p.id === product.node.id);
      return { ...product, status: dbProduct?.status };
    });
  return { matchedProducts, knitContact, store: session.shop };
};
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const product = await createShopProductAction(request);
    return product;
  } catch (error: any) {
    console.error("Erreur lors de la création du produit :", error);
    return { error: error.message, status: 400 };
  }
};

export default function page() {
  const { matchedProducts, knitContact, store } =
    useLoaderData<typeof loader>();
  return (
    <Page
      title="Your products"
      fullWidth
      subtitle="Here is the list of products requested by the Knit store, click on Add to Knit when everything is ready for you. If you made modification on a product, just click on Update button. Once listed, if you got any problem with a product, click on  Report problem."
    >
      <BlockStack gap={"200"}>
        {matchedProducts.filter((item: Product) => item.status === "CONFIRMED")
          .length > 0 && (
          <>
            <Text variant="headingLg" as="h2">
              Products listed on Knit
            </Text>
            <InlineGrid gap={"200"} columns={{ xs: 1, sm: 1, md: 2, lg: 4 }}>
              {matchedProducts
                .filter((item: Product) => item.status === "CONFIRMED")
                .map((item: Product) => (
                  <PartnerProductCard
                    key={item.node.id}
                    item={item}
                    knitContact={knitContact}
                    store={store}
                  />
                ))}
            </InlineGrid>
          </>
        )}
        {matchedProducts.filter((item: Product) => item.status === "PENDING")
          .length > 0 && (
          <>
            <Text variant="headingLg" as="h2">
              Products waiting for your action
            </Text>
            <InlineGrid gap={"200"} columns={{ xs: 1, sm: 1, md: 2, lg: 4 }}>
              {matchedProducts
                .filter((item: Product) => item.status === "PENDING")
                .map((item: Product) => (
                  <PartnerProductCard
                    key={item.node.id}
                    item={item}
                    knitContact={knitContact}
                    store={store}
                  />
                ))}
            </InlineGrid>
          </>
        )}
      </BlockStack>
    </Page>
  );
}
