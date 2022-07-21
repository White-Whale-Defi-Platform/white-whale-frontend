const drawer = {
  baseStyle: {
    overlay: {
      bg: "rgba(17, 17, 17, 0.2)",
      backdropFilter: "blur(12px)",
    },
    dialog: {
      borderRadius: "2xl",
      bg: "rgba(26,26,26,0.8)",
      py: "8",
      color: "white",
      boxShadow: "2xl",
    },
    closeButton: {
      color: "rgba(255, 255, 255, 0.6)",
      _focus: {
        boxShadow: "none",
      },
    },
  },
};

export default drawer;
