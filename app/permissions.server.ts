import { redirect } from "@remix-run/node";
import { authenticate } from "./shopify.server";

export async function requireAdmin(request: Request) {
  const { session } = await authenticate.admin(request);
  const adminShop = process.env.KNIT_SHOP || "";
  if (session.shop.toLowerCase() !== adminShop.toLowerCase()) {
    throw redirect("/app/partner");
  }
  return {}
}
export async function requirePartner(request: Request) {
  const { session } = await authenticate.admin(request);
  const adminShop = process.env.KNIT_SHOP || "";
  if (session.shop.toLowerCase() === adminShop.toLowerCase()) {
    throw redirect("/app/admin");
  }
  return {};
}
