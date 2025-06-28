export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CCMS Portal",
  description: "Centralized Control and Monitoring System for Outdoor Electrical Panels",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Devices",
      href: "/devices",
    },
    {
      label: "Map View",
      href: "/map",
    },
    {
      label: "Schedules",
      href: "/schedules",
    },
    {
      label: "Alerts",
      href: "/alerts",
    },
    {
      label: "Test Data",
      href: "/test-data",
    },
  ],
  navMenuItems: [
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Reports",
      href: "/reports",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    support: "/support",
    documentation: "/docs",
  },
};
