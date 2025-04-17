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

  if (!isAdmin) {
    // 1. Récupère l’état du partenaire chez Knit
    const res1 = await fetch(`${url}/api/knit-connect/get-partner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shop }),
    });
    if (!res1.ok) {
      throw new Response("Erreur Knit Connect", { status: 502 });
    }
    const data1 = await res1.json();
    const existing = data1?.existingPartner;

    // 2. Si déjà actif → synced
    if (existing?.status === "ACTIVE") {
      isSynced = true;
    }
    // 3. Si pending → on crée en base et on re‑check
    else if (existing?.status === "PENDING") {
      // génère la clé chiffrée
      const key = encrypt(session.accessToken || "");

      // appelle l’endpoint de création chez Knit
      const res2 = await fetch(`${url}/api/knit-connect/partner-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shop, key }),
      });
      if (!res2.ok) {
        throw new Response("Erreur Partner Connect", { status: 502 });
      }
      const data2 = await res2.json();

      // crée le partenaire en local
      await prisma.partner.create({
        data: { shop, accessToken: key },
      });

      // re‑vérifie l’état retourné
      if (data2?.existingPartner?.status === "ACTIVE") {
        isSynced = true;
      }
    }
    // sinon existing undefined ou autre statut → reste false
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
        content: "Admin Access Knit-Connect",
        url: "/app/admin",
      }}
    >
      <img
        alt="Knit logo"
        src="/logo.png"
        style={{
          objectFit: "contain",
          width: "100%",
          height: "auto",
        }}
      />
    </MediaCard>
  ) : (
    <MediaCard
      title="Welcome to Knit Connect"
      description="This application is reserved for exclusive partners of the Knit platform."
      primaryAction={{
        disabled: !isSynced,
        content: "Partner Access Knit-Connect",
        url: "/app/partner",
      }}
    >
      <img
        alt="Knit logo"
        src="/logo.png"
        style={{
          objectFit: "contain",
          width: "100%",
          height: "auto",
        }}
      />
    </MediaCard>
  );
}
