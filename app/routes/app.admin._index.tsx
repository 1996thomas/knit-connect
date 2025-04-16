import type { LoaderFunctionArgs } from "@remix-run/node";
import { Card, List, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { fetchPartners, fetchShopProduct } from "./fetch.server";
import { useLoaderData } from "@remix-run/react";
import { registerCarrierService } from "app/lib/carrierService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const partners = await fetchPartners();
  return { partners };
};

export default function Index() {
  const { partners = [] } = useLoaderData<typeof loader>();
  return (
    <Page fullWidth title="Knit-connect admin">
      <Text as={"h1"} variant="headingXl">
        Overview
      </Text>

      <Card>Nombre commande en cours</Card>
      <Card>Nombre commande 30 derniers jours</Card>
      <Card>Nombre commande ever</Card>
      <Card>CA</Card>
      
    </Page>
  );
}
