"use client";
import { forwardRef } from "react";
import { NavLink as NextNavLink } from "@/lib/navigation";

const NavLink = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof NextNavLink>>(
  (props, ref) => <NextNavLink ref={ref} {...props} />,
);

NavLink.displayName = "NavLink";

export { NavLink };
