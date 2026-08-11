export interface BrandConfig {
  name: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    sidebarBg: string;
    textDark: string;
    textMuted: string;
    selectedItemBg: string;
    selectedItemText: string;
    divider: string;
  };
}

export const brand: BrandConfig = {
  name: "Careers Empowered",
  colors: {
    primary: "#1a73e8",
    primaryHover: "#1557b0",
    secondary: "#5f6368",
    background: "#f8f9fa",
    sidebarBg: "#ffffff",
    textDark: "#202124",
    textMuted: "#5f6368",
    selectedItemBg: "#e8f0fe", // light-blue rounded background
    selectedItemText: "#1a73e8", // active blue text
    divider: "#e8eaed", // thin divider color
  },
};
