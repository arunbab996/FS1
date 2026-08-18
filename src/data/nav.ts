import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  Radar,
  Landmark,
  CreditCard,
  Layers,
  UserSearch,
  Waypoints,
  Users,
  Building2,
  TrendingUp,
  Telescope,
  Eye,
  FileText,
  HelpCircle,
  Crosshair,
} from "lucide-react";

export type NavView = "equity-signals" | "inbox" | "reports";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  badge?: string;
  collapsible?: boolean;
  /** Only nav items tied to an actual view are clickable; the rest are inert placeholders. */
  view?: NavView;
}

export const navItems: NavItem[] = [
  { label: "Inbox", icon: Inbox, view: "inbox" },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Equity Signals", icon: Radar, view: "equity-signals" },
  { label: "LP Signals", icon: Landmark, badge: "92" },
  { label: "Credit Signals", icon: CreditCard, badge: "15" },
  { label: "TFF", icon: Layers, collapsible: true },
  { label: "Researcher", icon: UserSearch, badge: "84" },
  { label: "Signal Source", icon: Waypoints },
  { label: "People", icon: Users },
  { label: "Companies", icon: Building2 },
  { label: "Traction", icon: TrendingUp },
  { label: "Scout", icon: Telescope, badge: "99+" },
  { label: "Watcher", icon: Eye },
  { label: "Reports", icon: FileText, view: "reports" },
  { label: "FAQ", icon: HelpCircle },
  { label: "Crosshair", icon: Crosshair },
];
