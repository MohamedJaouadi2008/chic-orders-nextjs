interface SaleBadgeProps {
  discountPercent: number;
  className?: string;
}

export function SaleBadge({ discountPercent, className = "" }: SaleBadgeProps) {
  return (
    <span className={`sale-badge ${className}`}>
      -{discountPercent}%
    </span>
  );
}
