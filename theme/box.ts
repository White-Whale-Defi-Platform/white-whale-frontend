const div = {
  sizes: {
    lg: {
      height: "14",
    },
  },
  variants: {
    pill: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
      borderRadius: "full",
      paddingY: { 1},
      paddingX: { 4},
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      outline: "none",
      borderRadius: "full",
      bg: "brand.500",
      color: "white",
      _hover: {
        bg: "white",
        color: "brand.900",
        _disabled: {
          bg: "brand.500",
          color: "white",
        },
      },
      _focus: {
        boxShadow: "none",
      },
    }
  },
};

export default div;
