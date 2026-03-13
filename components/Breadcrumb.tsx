"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Split pathname and filter out empty strings
  const pathSegments = pathname.split('/').filter(Boolean);

  // Remove 'dashboard' and 'admin' from breadcrumbs
  const relevantSegments = pathSegments.slice(2);

  if (relevantSegments.length === 0) return null;

  const breadcrumbs = relevantSegments.map((segment, index) => {
    const href = '/dashboard/admin/' + relevantSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    return { label, href };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard/admin"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Dashboard
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}