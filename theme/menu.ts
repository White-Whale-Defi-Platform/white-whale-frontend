const styles = {
  baseStyle: {
    list: {
      bg: "brand.600",
      border: "none",
      boxShadow: "lg",
      minW: "9rem",
      borderRadius: "2xl",
    },
    item: {
      py: "0.6rem",
      px: "1.2rem",
      color: "brand.50", 
      fontWeight: "500",
      fontSize: "sm",
      _hover: {
        color: "white",
      },
      _focus: {
        bg: "transparent",
      },
      _active: {
        bg: "transparent",
      },
      _expanded: {
        bg: "transparent",
      },
    },
  },
};

export default styles;
