import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import { Page, Layout, Text, Link } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { requirePartner } from "app/permissions.server";
import { NavMenu } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePartner(request);
  return null;
};

export default function Index() {
  return (
    <>
      <NavMenu>
        <Link url="/app/partner">Overview</Link>
        <Link url="/app/partner/products">Products</Link>
        <Link url="/app/partner/orders">Orders</Link>
        <Link url="/app/partner/payout">Payout</Link>
      </NavMenu>
      <Outlet />
    </>
  );
}
