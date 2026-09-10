import { Badge } from "@/components/ui/badge";
import { conditionLabel, cn } from "@/lib/utils";
import type { Condition } from "@/db/schema";

const VARIANT: Record<Condition, "new" | "likenew" | "excellent" | "good"> = {
  NEW: "new",
  LIKE_NEW: "likenew",
  EXCELLENT: "excellent",
  GOOD: "good",
};

export function ConditionBadge({
  condition,
  className,
}: {
  condition: Condition;
  className?: string;
}) {
  return (
    <Badge variant={VARIANT[condition]} className={cn("backdrop-blur-xl", className)}>
      {conditionLabel(condition)}
    </Badge>
  );
}
