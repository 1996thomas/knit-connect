import {
  Badge,
  BlockStack,
  Card,
  Icon,
  InlineStack,
  List,
  Text,
} from "@shopify/polaris";
import {
  CashDollarIcon,
  EmailIcon,
  PhoneIcon,
  ProfileIcon,
} from "@shopify/polaris-icons";

export default function PartnerInfoCard({
  info,
}: {
  info: {
    existingPartner: {
      commissionRate: string;
      shop_name: string;
      shop_url: string;
      createdAt: string;
      contactName: string;
      phone: string;
      email: string;
      country: string;
      address1: string;
      city: string;
      zipCode: string;
    };
  };
}) {
  const { existingPartner } = info;
  const date = new Date(existingPartner?.createdAt);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" gap="200">
          <Text as="p" variant="bodyLg">
            {existingPartner?.shop_name}
          </Text>
          <InlineStack gap="100">
            <Badge icon={CashDollarIcon} tone="info" size="small">
              {`${existingPartner?.commissionRate}%`}
            </Badge>
            <Badge tone="magic" size="small">
              {existingPartner?.shop_url}
            </Badge>
            <Badge tone="success">{`Partner since ${formattedDate}`}</Badge>
          </InlineStack>
        </InlineStack>
        <InlineStack align="space-between">
          <InlineStack gap="100">
            <Icon source={ProfileIcon} />
            <Text as="p" variant="bodyMd">
              {existingPartner?.contactName}
            </Text>
          </InlineStack>
          <InlineStack gap="100">
            <Icon source={PhoneIcon} />
            <Text as="p" variant="bodyMd">
              {existingPartner?.phone}
            </Text>
          </InlineStack>
          <InlineStack gap="100">
            <Icon source={EmailIcon} />
            <Text as="p" variant="bodyMd">
              {existingPartner?.email}
            </Text>
          </InlineStack>
        </InlineStack>
        <InlineStack gap="100">
          <InlineStack gap={"100"}>
            <Badge tone="info" size="small">
              {existingPartner?.country}
            </Badge>
            <Text as="p" variant="bodyMd">
              {existingPartner?.address1},
            </Text>
            <Text as="p" variant="bodyMd">
              {existingPartner?.city},
            </Text>
            <Text as="p" variant="bodyMd">
              {existingPartner?.zipCode}
            </Text>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
