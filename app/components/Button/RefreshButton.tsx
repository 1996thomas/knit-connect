// RefreshButton.tsx
import { useRevalidator } from "@remix-run/react";
import { Button } from "@shopify/polaris";

export default function RefreshButton() {
  const { revalidate } = useRevalidator();

  return <Button onClick={() => revalidate()}>Refresh Data</Button>;
}
