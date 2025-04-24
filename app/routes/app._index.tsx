// routes/app/_index/route.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MediaCard } from "@shopify/polaris";
import { encrypt } from "app/lib/encrypt";
import { authenticate } from "app/shopify.server";
import prisma from "../db.server";

interface LoaderData {
  isAdmin: boolean;
  isSynced: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const token = process.env.WEBSITE_TOKEN || "";
  const url = process.env.WEBSITE_URL || "";

  const isAdmin = shop.toLowerCase() === process.env.KNIT_SHOP?.toLowerCase();
  let isSynced = false;

  if (isAdmin) {
    const existingAdmin = await prisma.admin.findUnique({
      where: { shop },
    });
    if (existingAdmin) {
      return { isAdmin, isSynced };
    }
    await prisma.admin.create({
      data: {
        shop,
        accessToken: encrypt(session.accessToken || ""),
      },
    });
  }

  if (!isAdmin) {
    let existing: { status?: string } | undefined;
    try {
      const res1 = await fetch(`${url}/api/knit-connect/get-partner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shop }),
      });
      const data1 = await res1.json();
      existing = data1?.existingPartner;
    } catch (e) {
      console.warn(
        "⚠️ Erreur fetch get-partner, on considère non synchronisé",
        e,
      );
    }

    // 2. Si actif, on marque synced
    if (existing?.status === "ACTIVE") {
      isSynced = true;
    }
    // 3. Si pending, on tente la création et on re-vérifie
    else if (existing?.status === "PENDING") {
      const key = encrypt(session.accessToken || "");
      try {
        const res2 = await fetch(`${url}/api/knit-connect/partner-connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shop, key }),
        });
        const data2 = await res2.json();
        await prisma.partner.create({ data: { shop, accessToken: key } });
        if (data2?.existingPartner?.status === "ACTIVE") {
          isSynced = true;
        }
      } catch (e) {
        console.warn(
          "⚠️ Erreur partner-connect ou DB, on reste non synchronisé",
          e,
        );
      }
    }
  }

  return json<LoaderData>({ isAdmin, isSynced });
};

export default function Index() {
  const { isAdmin, isSynced } = useLoaderData<LoaderData>();

  return isAdmin ? (
    <MediaCard
      title="Welcome to Knit Connect"
      description="This application is reserved for exclusive partners of the Knit platform."
      primaryAction={{
        content: "Admin Access Knit‑Connect",
        url: "/app/admin",
      }}
    >
      <img
        alt="Knit logo"
        src="/logo.png"
        style={{ objectFit: "contain", width: "100%", height: "auto" }}
      />
    </MediaCard>
  ) : (
    <MediaCard
      title="Welcome to Knit Connect"
      description="This application is reserved for exclusive partners of the Knit platform."
      primaryAction={{
        disabled: !isSynced,
        content: "Partner Access Knit‑Connect",
        url: "/app/partner",
      }}
    >
      <img
        alt="Knit logo"
        src="/logo.png"
        style={{ objectFit: "contain", width: "100%", height: "auto" }}
      />
    </MediaCard>
  );
}
