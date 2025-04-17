import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import {
  Badge,
  Button,
  Card,
  FormLayout,
  InlineStack,
  Page,
  Select,
  TextField,
} from "@shopify/polaris";
import { countryNameOptions } from "app/lib/countryNameOptions";
import { requireAdmin } from "app/permissions.server";
import { useCallback, useEffect, useState } from "react";
import prisma from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = process.env.WEBSITE_URL || "";
  const token = process.env.WEBSITE_TOKEN || "";
  const formData = await request.formData();
  const partnerName = formData.get("partnerName");
  const shopifyStore = formData.get("shopifyStore");
  const address = formData.get("address");
  const city = formData.get("city");
  const contactName = formData.get("contactName");
  const country = formData.get("country");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const zipcode = formData.get("zipcode");

  if (
    typeof partnerName !== "string" ||
    partnerName.trim() === "" ||
    typeof shopifyStore !== "string" ||
    shopifyStore.trim() === "" ||
    typeof address !== "string" ||
    address.trim() === "" ||
    typeof city !== "string" ||
    city.trim() === "" ||
    typeof country !== "string" ||
    country.trim() === "" ||
    typeof contactName !== "string" ||
    contactName.trim() === "" ||
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof phone !== "string" ||
    phone.trim() === "" ||
    typeof zipcode !== "string" ||
    zipcode.trim() === ""
  ) {
    return { error: "Please fill out all required fields", status: 400 };
  }

  const newPartner = {
    partnerName: partnerName.trim(),
    shopifyStore: shopifyStore.trim(),
    address: address.trim(),
    city: city.trim(),
    contactName: contactName.trim(),
    country: country.trim(),
    email: email.trim(),
    phone: phone.trim(),
    zipcode: zipcode.trim(),
  };

  // Exemple de vérification dans la base
  const existingPartner = await prisma.partner.findFirst({
    where: { shop: newPartner.shopifyStore },
  });

  if (existingPartner) {
    return { error: "Partner already exists", status: 409 };
  }

  const response = await fetch(`${url}/api/knit-connect/partner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPartner }),
  });

  if (response.status === 409) {
    return { error: "Partner already exists", status: 409 };
  }

  // Enregistrement réussi : retourne les données de succès
  return { success: true, partnerName: newPartner.partnerName };
};
export default function PageComponent() {
  const actionData = useActionData<{
    success?: boolean;
    partnerName?: string;
    error?: string;
  }>();
  const navigate = useNavigate();

  const [partnerName, setPartnerName] = useState("");
  const [shopifyStore, setShopifyStore] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [country, setCountry] = useState("");

  const handleSelectChange = useCallback(
    (value: string) => setCountry(value),
    [],
  );

  // Si l'action renvoie un succès, on affiche un message puis redirige après 2 secondes
  useEffect(() => {
    if (actionData && actionData.success && actionData.partnerName) {
      const timer = setTimeout(() => {
        navigate(`/app/admin/partners`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionData, navigate]);

  return (
    <Page title="Add a partner">
      <Card>
        {/* Affichage des erreurs si présentes */}
        {actionData?.error && (
          <p style={{ color: "red", marginBottom: "1rem" }}>
            {actionData.error}
          </p>
        )}
        <Form method="post">
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Partner Name"
                name="partnerName"
                value={partnerName}
                onChange={setPartnerName}
                autoComplete="off"
                requiredIndicator
                placeholder="Brand name"
              />
              <TextField
                label="Partner Shopify Store"
                name="shopifyStore"
                value={shopifyStore}
                onChange={setShopifyStore}
                autoComplete="off"
                requiredIndicator
                placeholder="shopify-store.myshopify.com"
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <TextField
                label="Contact Name"
                name="contactName"
                value={contactName}
                onChange={setContactName}
                autoComplete="off"
                requiredIndicator
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="off"
                requiredIndicator
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                autoComplete="off"
                requiredIndicator
              />
            </FormLayout.Group>
            <TextField
              label="Address"
              name="address"
              value={address}
              onChange={setAddress}
              autoComplete="off"
              requiredIndicator
            />
            <TextField
              label="City"
              name="city"
              value={city}
              onChange={setCity}
              autoComplete="off"
              requiredIndicator
            />
            <Select
              name="country"
              label="Country"
              options={countryNameOptions}
              onChange={handleSelectChange}
              value={country}
              requiredIndicator
              placeholder="Select a country"
            />
            <TextField
              label="Zipcode"
              name="zipcode"
              value={zipcode}
              onChange={setZipcode}
              autoComplete="off"
              requiredIndicator
            />
            <Button submit>Submit</Button>
            <InlineStack gap={"200"}>
              {actionData?.success && (
                <Badge tone="success">
                  Registration successful, redirecting...
                </Badge>
              )}
            </InlineStack>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
