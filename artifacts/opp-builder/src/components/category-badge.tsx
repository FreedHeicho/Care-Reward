import { OpportunityCategory } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: OpportunityCategory;
  className?: string;
}

const categoryConfig: Record<OpportunityCategory, { label: string; color: string }> = {
  CARE_SITE_ALTERNATIVE: {
    label: "Care Site",
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  },
  CARE_PROTOCOL: {
    label: "Protocol",
    color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  PREVENTATIVE_CARE: {
    label: "Preventative",
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  CARE_QUALITY: {
    label: "Quality",
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
