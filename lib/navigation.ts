import {
  Dumbbell,
  Home,
  LineChart,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/workout/today", label: "Workout", icon: Zap },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export function getMainNavItems(isAuthenticated: boolean): NavItem[] {
  if (isAuthenticated) return mainNavItems;
  return mainNavItems.filter((item) => item.href !== "/profile");
}

export function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  if (
    href === "/workout/today" &&
    pathname.startsWith("/workout/training")
  ) {
    return true;
  }
  return false;
}
