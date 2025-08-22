import type { ReactNode } from "react";
import Header from "./Header";
import ErrorBoundary from "./ErrorBoundary";

interface LayoutProps {
  children: ReactNode;
  organizationSlug?: string;
  showHeader?: boolean;
}

export default function Layout({
  children,
  organizationSlug,
  showHeader = true,
}: LayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {showHeader && <Header organizationSlug={organizationSlug} />}
        <main className="flex-1">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
