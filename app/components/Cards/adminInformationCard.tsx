import {
  Badge,
  BlockStack,
  Button,
  Card,
  Icon,
  InlineStack,
  Text,
} from "@shopify/polaris";
import {
  CashDollarIcon,
  EmailIcon,
  PhoneIcon,
  ProfileIcon,
} from "@shopify/polaris-icons";

interface AdminInfo {
  commissionRate: any;
  shop_name?: string;
  shop_url?: string;
  createdAt?: Date;
  contactName?: string;
  phone?: string;
  email?: string;
  country?: string;
  address1?: string;
  city?: string;
  zipCode?: string;
}

export default function AdminInfoCard({ info }: { info: AdminInfo }) {
  const date = new Date(info?.createdAt ?? Date.now());
  const formattedDate = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <Card>
      <BlockStack gap="200">
        <BlockStack gap={"400"}>
          <InlineStack align="space-between" gap="200">
            <Text as="p" variant="bodyLg">
              {info?.shop_name}
            </Text>
            <Button
              icon={ProfileIcon}
              url={`/app/admin/handle/${info.shop_url}`}
            >
              Update informations
            </Button>
          </InlineStack>
          <InlineStack gap="100" align="space-between">
            <Badge tone="magic" size="small">
              {info?.shop_url}
            </Badge>
            <Badge tone="success">{`Partner since ${formattedDate}`}</Badge>
          </InlineStack>
        </BlockStack>
        <InlineStack align="space-between">
          <InlineStack gap="100">
            <Icon source={ProfileIcon} />
            <Text as="p" variant="bodyMd">
              {info?.contactName}
            </Text>
          </InlineStack>
          <InlineStack gap="100">
            <Icon source={PhoneIcon} />
            <Text as="p" variant="bodyMd">
              {info?.phone}
            </Text>
          </InlineStack>
          <InlineStack gap="100">
            <Icon source={EmailIcon} />
            <Text as="p" variant="bodyMd">
              {info?.email}
            </Text>
          </InlineStack>
        </InlineStack>
        <InlineStack gap="100" align="space-between">
          <InlineStack gap={"100"}>
            <Badge tone="info" size="small">
              {info?.country}
            </Badge>
            <Text as="p" variant="bodyMd">
              {info?.address1},
            </Text>
            <Text as="p" variant="bodyMd">
              {info?.city},
            </Text>
            <Text as="p" variant="bodyMd">
              {info?.zipCode}
            </Text>
          </InlineStack>
          <Badge icon={CashDollarIcon} tone="info" size="small">
            {`${info?.commissionRate}%`}
          </Badge>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
