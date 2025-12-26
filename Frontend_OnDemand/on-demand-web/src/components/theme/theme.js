import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#E6F6FF",
      100: "#BAE3FF",
      200: "#7CC4FA",
      300: "#47A3F3",
      400: "#2186EB",
      500: "#0967D2",
      600: "#0552B5",
      700: "#03449E",
      800: "#01337D",
      900: "#002159",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: "15px",
          boxShadow: "0px 3.5px 5.5px rgba(0, 0, 0, 0.02)",
        },
      },
      variants: {
        primary: {
          container: {
            bg: "white",
            _dark: {
              bg: "gray.800",
            },
          },
        },
      },
      defaultProps: {
        variant: "primary",
      },
    },
    CardHeader: {
      baseStyle: {
        borderBottom: "1px solid",
        borderColor: "gray.200",
        _dark: {
          borderColor: "gray.600",
        },
        px: "22px",
        py: "16px",
      },
    },
    CardBody: {
      baseStyle: {
        p: "22px",
      },
    },
  },
  styles: {
    global: {
      "html, body": {
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },
  },
});

export default theme;
