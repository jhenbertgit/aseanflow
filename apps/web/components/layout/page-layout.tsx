import type { ReactNode } from "react";
import { layout, spacing } from "@aseanflow/ui/lib/design-tokens";
import { cn } from "@aseanflow/ui/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  containerSize?: "standard" | "narrow" | "wide";
  withPadding?: boolean;
}

/**
 * Reusable page layout component for consistent container sizing and spacing
 * across the ASEANFlow application.
 *
 * @param children - The page content to render
 * @param className - Additional CSS classes to apply
 * @param containerSize - Container width variant (standard, narrow, wide)
 * @param withPadding - Whether to include standard vertical padding
 */
export function PageLayout({
  children,
  className,
  containerSize = "standard",
  withPadding = true,
}: PageLayoutProps) {
  const containerClass = layout.container[containerSize];

  return (
    <div
      className={cn(
        containerClass,
        withPadding && spacing.section.md,
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SectionLayoutProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "muted";
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable section layout component for consistent section spacing
 *
 * @param children - The section content to render
 * @param className - Additional CSS classes to apply
 * @param background - Background variant (default or muted)
 * @param size - Section spacing size (sm, md, lg)
 */
export function SectionLayout({
  children,
  className,
  background = "default",
  size = "md",
}: SectionLayoutProps) {
  return (
    <section
      className={cn(
        "w-full",
        spacing.section[size],
        background === "muted" && "bg-muted",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface CenteredContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
}

/**
 * Centered content wrapper for text-heavy sections like hero areas
 *
 * @param children - Content to center
 * @param className - Additional CSS classes
 * @param maxWidth - Maximum width constraint
 */
export function CenteredContent({
  children,
  className,
  maxWidth = "4xl",
}: CenteredContentProps) {
  return (
    <div
      className={cn(
        layout.flex.centerColumn,
        `max-w-${maxWidth}`,
        "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
