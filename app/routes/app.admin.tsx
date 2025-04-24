import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";
import { Page, Layout, Text, Link } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { requireAdmin } from "app/permissions.server";
import { NavMenu } from "@shopify/app-bridge-react";
import { registerCarrierService } from "app/lib/carrierService";
import { retrieveCarrierService } from "app/lib/retrieveCarrierService";
import { updateCarrierService } from "app/lib/updateCarrierService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const actualCarrierService = await retrieveCarrierService();
  if (actualCarrierService && actualCarrierService?.length > 0) {
    await updateCarrierService(actualCarrierService[0]);
  } else {
    await registerCarrierService();
  }
  return null;
};

export default function Index() {
  return (
    <>
      <NavMenu>
        <Link url="/app/admin">Overview</Link>
        <Link url="/app/admin/partners">Partners</Link>
        <Link url="/app/admin/handle/new">Add Partners</Link>
      </NavMenu>
      <Outlet />
    </>
  );
}
