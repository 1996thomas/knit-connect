// routes/app/_index/route.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import {  useLoaderData } from "@remix-run/react";
import { MediaCard, Page } from "@shopify/polaris";
import { encrypt } from "app/lib/encrypt";
import { authenticate } from "app/shopify.server";
import prisma from "../db.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = process.env.WEBSITE_URL || "";
  const token = process.env.WEBSITE_TOKEN || "";
  let isAdmin = false;
  let isSynced = false;
  if (session.shop.toLowerCase() === process.env.KNIT_SHOP?.toLowerCase()) {
    isAdmin = true;
  }
  const response = await fetch(`${url}/api/knit-connect/get-partner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shop: session.shop }),
  });
  const data = await response.json();
  const shop = session.shop;
  const key = encrypt(session.accessToken || "");
  if (!isAdmin) {
    if (data?.existingPartner.status === "ACTIVE") {
      isSynced = true;
      return { session, isAdmin, isSynced };
    }
    if (data?.existingPartner.status === "PENDING") {
      const response = await fetch(`${url}/api/knit-connect/partner-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shop, key }),
      });
      const data = await response.json();

      const newPartner = await prisma.partner.create({
        data: {
          shop,
          accessToken: key,
        },
      });
      if (data?.existingPartner.status === "ACTIVE" && newPartner) {
        isSynced = true;
      }
    }
  }
  return { session, isAdmin, isSynced };
};

export default function Index() {
  const { isAdmin, isSynced } = useLoaderData<typeof loader>();
  return isAdmin ? (
    <MediaCard
      title="Welcome to Knit Connect"
      description="This application is reserved for exclusive partners of the Knit platform."
      primaryAction={{
        content: "Admin Access Knit-Connect",
        url: "/app/admin",
      }}
    >
      <img
        alt=""
        width="30%"
        height="100%"
        style={{
          objectFit: "contain",
          objectPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
        src="/logo.png"
      />
    </MediaCard>
  ) : (
    <MediaCard
      title="Welcome to Knit Connect"
      description="This application is reserved for exclusive partners of the Knit platform."
      primaryAction={{
        disabled: isSynced ? false : true,
        content: "Partner Access Knit-Connect",
        url: "/app/partner",
      }}
    >
      <img
        alt=""
        width="30%"
        height="100%"
        style={{
          objectFit: "contain",
          objectPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
        src="/logo.png"
      />
    </MediaCard>
  );
}
