import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
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
import { useCallback, useEffect, useState } from "react";
import { fetchPartner } from "../lib/fetch.server";
import prisma from "../db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { partner } = params;
  const partnerData = await fetchPartner(partner || "");
  if (!partnerData?.accessToken) {
    return null;
  }
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
  const partnerFromKnit = partnersFromKnit.find(
    (p: { shop_url: string }) => p.shop_url === partnerData?.shop,
  );
  return { partnerFromKnit };
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

  const updatePartner = {
    partnerName: partnerName,
    shopifyStore: shopifyStore,
    address: address,
    city: city,
    contactName: contactName,
    country: country,
    email: email,
    phone: phone,
    zipcode: zipcode,
  };

  // Exemple de vérification dans la base
  const partner = await prisma.partner.findFirst({
    where: { shop: updatePartner.shopifyStore as string },
  });
  if (!partner) {
    return { error: "Partner not found", status: 404 };
  }
  const response = await fetch(`${url}/api/knit-connect/partner`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ updatePartner, partner }),
  });

  if (response.status === 409) {
    return { error: "Partner already exists", status: 409 };
  }

  return { success: true, partnerName: updatePartner.partnerName };
};
export default function PageComponent() {
  const loaderData = useLoaderData<typeof loader>();
  const partnerFromKnit = loaderData?.partnerFromKnit || null;
  const actionData = useActionData<{
    success?: boolean;
    partnerName?: string;
    error?: string;
  }>();
  const navigate = useNavigate();

  const [partnerName, setPartnerName] = useState(
    partnerFromKnit?.shop_name || "",
  );
  const [shopifyStore, setShopifyStore] = useState(
    partnerFromKnit?.shop_url || "",
  );
  const [address, setAddress] = useState(partnerFromKnit?.address1 || "");
  const [city, setCity] = useState(partnerFromKnit?.city || "");
  const [contactName, setContactName] = useState(
    partnerFromKnit?.contactName || "",
  );
  const [email, setEmail] = useState(partnerFromKnit?.email || "");
  const [phone, setPhone] = useState(partnerFromKnit?.phone || "");
  const [zipcode, setZipcode] = useState(partnerFromKnit?.zipCode || "");
  const [country, setCountry] = useState(partnerFromKnit?.country || "");

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
                placeholder={partnerFromKnit.shop_name || "Brand name"}
              />
              <TextField
                label="Partner Shopify Store"
                // disabled
                name="shopifyStore"
                value={shopifyStore}
                autoComplete="off"
                requiredIndicator
                placeholder={partnerFromKnit.shop_url || "Shopify store"}
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
                placeholder={partnerFromKnit.contactName || "Contact Name"}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="off"
                requiredIndicator
                placeholder={partnerFromKnit.email || "Email"}
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                autoComplete="off"
                requiredIndicator
                placeholder={partnerFromKnit.phone || "Phone"}
              />
            </FormLayout.Group>
            <TextField
              label="Address"
              name="address"
              value={address}
              onChange={setAddress}
              autoComplete="off"
              requiredIndicator
              placeholder={partnerFromKnit.address1 || "Address"}
            />
            <TextField
              label="City"
              name="city"
              value={city}
              onChange={setCity}
              autoComplete="off"
              requiredIndicator
              placeholder={partnerFromKnit.city || "City"}
            />
            <Select
              name="country"
              label="Country"
              options={countryNameOptions}
              onChange={handleSelectChange}
              value={country}
              requiredIndicator
              placeholder={partnerFromKnit.country || "Select a country"}
            />
            <TextField
              label="Zipcode"
              name="zipcode"
              value={zipcode}
              onChange={setZipcode}
              autoComplete="off"
              requiredIndicator
              placeholder={partnerFromKnit.zipCode || "Zipcode"}
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
