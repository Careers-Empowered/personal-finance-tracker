export interface BrandConfig {
  name: string;

  typography: {
    logo: string;
    heading: string;
    body: string;
  };

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
    orange: string;
    charcoal: string;
  };
}

export const brand: BrandConfig = {
  name: "Careers Empowered",

  typography: {
    logo: "DM Sans",
    heading: "Source Sans 3",
    body: "Poppins",
  },

  colors: {
    primary: "#d38333",
    primaryHover: "#b56e29",
    secondary: "#231F20",
    background: "#f4f5f7",
    sidebarBg: "#231F20",
    textDark: "#231F20",
    textMuted: "#7f8c8d",
    selectedItemBg: "#d38333",
    selectedItemText: "#ffffff",
    divider: "#2d2a2b",

    orange: "#d38333",
    charcoal: "#231F20",
  },
};