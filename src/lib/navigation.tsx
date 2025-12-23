"use client";
import NextLink from "next/link";
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type LinkProps = React.ComponentProps<typeof NextLink> & { to?: string };

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, href, ...props }, ref) => {
    const finalHref = href || to || "/";
    return <NextLink ref={ref} href={finalHref} {...props} />;
  }
);
Link.displayName = "Link";

export const NavLink = forwardRef<
  HTMLAnchorElement,
  LinkProps & { activeClassName?: string; pendingClassName?: string; className?: string }
>(({ className, activeClassName, pendingClassName, to, href, ...props }, ref) => {
  const pathname = usePathname();
  const finalHref = href || to || "/";
  const isActive = pathname === finalHref;
  return (
    <NextLink
      ref={ref}
      href={finalHref}
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
});
NavLink.displayName = "NavLink";

export const useNavigate = () => {
  const router = useRouter();
  return (to: string) => router.push(to);
};

export const useLocation = () => {
  const pathname = usePathname();
  // Note: search params removed to avoid Suspense requirement in static pages
  // Use useSearchParams() directly in components that need it (wrapped in Suspense)
  return { pathname, search: "" };
};

export const useParams = <T extends Record<string, string>>() => {
  const params = useNextParams();
  return params as unknown as T;
};

export const useSearchParams = useNextSearchParams;
