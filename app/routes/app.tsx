import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate, useRevalidator, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { Page } from "@shopify/polaris";
import { IconsFilledIcon, RefreshIcon } from "@shopify/polaris-icons";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const {revalidate} = useRevalidator()
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Page
        fullWidth
        title="Knit-connect"
        primaryAction={{
          content: "Contact us",
          url: "mailto:t.reynaud@99knit.com",
        }}
        secondaryActions={[
          {
            content: "Legal Notices",
            url: "/app/legal-notices",
          },
          {
            content: "Privacy Policy",
            url: "/app/privacy-policy",
          },
          {
            content: "Refresh app",
            onAction: () => {
              revalidate()
            },
            icon: RefreshIcon
          },
        ]}
      >
        <Outlet />
      </Page>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
