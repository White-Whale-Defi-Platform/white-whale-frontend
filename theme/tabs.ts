const style = {
  baseStyle: {
    tabpanel: {
      padding: "0",
      paddingTop: "6",
    },
  },
  variants: {
    brand: {
      tablist: {
        bg: "rgba(26,26,26,1)",
        px: "8",
        justifyContent: "center",
        mt: "-14",
        gap: "1rem",
        width: "fit-content",
        mx: "auto",
      },
      tab: {
        fontWeight: "700",
        color: "whiteAlpha.600",
        fontSize: "lg",
        _selected: {
          color: "white",
        },
        _focus: {
          boxShadow: "none",
          outline: "none",
        },
      },
      tabpanel: {
        pt: 0,
      },
    },
    "soft-rounded": {
      tablist: {
        gap: "1rem",
      },
      tab: {
        borderRadius: "full",
        fontWeight: "500",
        color: "white",
        lineHeight: "1rem",
        fontSize: "sm",
        border: "1px solid #303348",
        _selected: {
          borderColor: "transparent",
          color: "brand.900",
          bg: "brand.500",
        },
        _focus: {
          boxShadow: "none",
          outline: "none",
        },
      },
    },
  },
};

export default style;
