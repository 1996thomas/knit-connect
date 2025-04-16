// app/components/PriorityBadge.tsx
import React from "react";
import { Badge } from "@shopify/polaris";
import { CalendarTimeIcon } from "@shopify/polaris-icons";

interface PriorityBadgeProps {
  createdAt: string;
  delivered?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  createdAt,
  delivered = false,
}) => {
  const now = new Date();
  const orderCreatedAt = new Date(createdAt);
  const hoursElapsed =
    (now.getTime() - orderCreatedAt.getTime()) / (3600 * 1000);
  const hoursLeft = Math.ceil(72 - hoursElapsed);

  // Si la commande est honorée, on retourne directement le badge "Honoré"
  if (delivered) {
    return <Badge tone="success">Complete</Badge>;
  }

  let badgeContent: string;
  let badgeStatus: "success" | "info" | "warning" | "critical";

  switch (true) {
    case hoursLeft <= 0:
      badgeContent = "Critique";
      badgeStatus = "critical";
      break;
    case hoursLeft <= 24:
      badgeContent = ` ${hoursLeft}h left`;
      badgeStatus = "critical";
      break;
    case hoursLeft <= 48:
      badgeContent = ` ${hoursLeft}h left`;
      badgeStatus = "warning";
      break;
    default:
      badgeContent = ` ${hoursLeft}h left`;
      badgeStatus = "info";
  }

  return <Badge icon={CalendarTimeIcon} tone={badgeStatus}>{badgeContent}</Badge>;
};

export default PriorityBadge;
