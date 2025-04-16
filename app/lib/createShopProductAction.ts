// app/actions/shopProductActions.server.ts
import { authenticate } from "app/shopify.server";
import { createShopProduct } from "./post.server";

export async function createShopProductAction(request: Request) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const node = JSON.parse(formData.get("node") as string);
  const action = formData.get("action") as string;
  if (!node) {
    throw new Error("Le titre est requis");
  }

  const adminShop = process.env.KNIT_SHOP || "";
  const accessToken = process.env.KNIT_TOKEN || "";
  const apiVersion = process.env.API_VERSION || "";
  const shop = session.shop || "";

  const result = await createShopProduct(
    adminShop,
    accessToken,
    apiVersion,
    node,
    shop,
    action,
  );

  if (result.userErrors && result.userErrors.length > 0) {
    throw new Error(result.userErrors[0].message);
  }

  return result.product;
}
