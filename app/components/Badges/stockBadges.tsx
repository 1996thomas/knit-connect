import { Badge, BadgeProps } from "@shopify/polaris";
import { ProductListIcon } from "@shopify/polaris-icons";

export default function StockBadge({
  availableQuantity,
}: {
  availableQuantity: number;
}) {
  // Déclarez explicitement que le retour est de type BadgeProps["tone"]
  const getBadgeTone = (quantity: number): BadgeProps["tone"] => {
    if (quantity < 5) return "critical-strong";
    if (quantity < 10) return "critical";
    if (quantity < 20) return "warning";
    return "success";
  };

  return (
    <Badge icon={ProductListIcon} tone={getBadgeTone(availableQuantity)}>
    { ` ${availableQuantity.toString()}`}
    </Badge>
  );
}
