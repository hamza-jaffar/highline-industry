import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const currentStyles = statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-bold border",
      currentStyles,
      className
    )}>
      {status.toUpperCase()}
    </span>
  );
}
