// src/styles/theme.js

export const colors = {
  primary: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    main: "#667eea",
    dark: "#764ba2",
  },
  secondary: {
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    main: "#f093fb",
    dark: "#f5576c",
  },
  success: {
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    main: "#4facfe",
    light: "#e3f2fd",
  },
  warning: {
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    main: "#fa709a",
    light: "#fff3e0",
  },
  danger: {
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
    main: "#ff6b6b",
  },
  dark: {
    main: "#2c3e50",
    light: "#34495e",
  },
  light: {
    main: "#f5f5f5",
    bg: "#fafafa",
  },
  white: "#ffffff",
  text: {
    primary: "#2c3e50",
    secondary: "#7f8c8d",
    light: "#95a5a6",
  }
};

export const shadows = {
  sm: "0 2px 8px rgba(0,0,0,0.08)",
  md: "0 4px 16px rgba(0,0,0,0.12)",
  lg: "0 8px 30px rgba(0,0,0,0.15)",
  xl: "0 12px 40px rgba(0,0,0,0.2)",
};

export const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
};

export const spacing = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

export const typography = {
  h1: {
    fontSize: "36px",
    fontWeight: "800",
    lineHeight: "1.2",
  },
  h2: {
    fontSize: "30px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  h3: {
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  h4: {
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  body: {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.5",
  },
  small: {
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "1.5",
  },
};
