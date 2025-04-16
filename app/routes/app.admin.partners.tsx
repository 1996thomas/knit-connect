import { LoaderFunctionArgs } from "@remix-run/node";
import React from "react";
import { fetchPartners } from "./fetch.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  Avatar,
  Badge,
  Bleed,
  BlockStack,
  Card,
  Divider,
  InlineGrid,
  InlineStack,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import { requireAdmin } from "app/permissions.server";
import { authenticate } from "app/shopify.server";
import { PlusCircleIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);
  const response = await fetch(
    `${process.env.WEBSITE_URL}/api/knit-connect/get-partners`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBSITE_TOKEN}`,
      },
    },
  );
  const partnersFromKnit = await response.json();

  return { partnersFromKnit };
};
export default function page() {
  const { partnersFromKnit } = useLoaderData<typeof loader>();

  return (
    <Page
      fullWidth
      title="Partners"
      subtitle="This is the list of your partners, Partner in orange are not active"
      primaryAction={{
        icon: PlusCircleIcon,
        content: "Add a partner",
        url: "/app/admin/handle/new",
      }}
    >
      <BlockStack gap={"500"}>
        {partnersFromKnit.length > 0 && (
          <Card>
            <InlineStack gap={"200"}>
              {partnersFromKnit.map(
                (partner: {
                  shop_url: string;
                  shop_name: string;
                  status: string;
                }) => (
                  <InlineStack align="start">
                    {partner.status === "ACTIVE" ? (
                      <Link to={`/app/admin/partners/${partner.shop_url}`}>
                        <Badge tone="magic">{partner.shop_name}</Badge>
                      </Link>
                    ) : (
                      <Badge tone="warning">{partner.shop_name}</Badge>
                    )}
                  </InlineStack>
                ),
              )}
            </InlineStack>
          </Card>
        )}

        <Divider borderColor="border" borderWidth="050" />

        <Outlet />
      </BlockStack>
    </Page>
  );
}
