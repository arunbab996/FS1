import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
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

export interface NavItem {
  label: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
  collapsible?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Equity Signals", icon: Radar, active: true },
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
  { label: "Reports", icon: FileText },
  { label: "FAQ", icon: HelpCircle },
  { label: "Crosshair", icon: Crosshair },
];
