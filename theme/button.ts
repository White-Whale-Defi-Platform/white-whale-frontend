const button = {
  sizes: {
    lg: {
      height: "14",
    },
  },
  variants: {
    primary: {
      outline: "none",
      borderRadius: "78px",
      paddingX: 6,
      bg: "brand.500",
      color: "white",
      _disabled: {
        bg: "brand.50",
        color: "white",
        opacity: 0.8
      },
      _hover: {
        bg: "brand.300",
        color: "white",
        _disabled: {
          bg: "brand.50",
          color: "white",
          opacity: 0.8
        },
      },
      _focus: {
        boxShadow: "none",
      },
    },
    secondary: {
      // outline: "none",
      borderRadius: "full",
      borderWidth: "1px",
      borderColor: "white",
      color: "white",
      _hover: {
        bg: "white",
        color: "brand.900",
      },
      _active: {
        bg: "white",
        color: "brand.900",
      },
      _focus: {
        boxShadow: "none",
      },
    },
    outline: {
      borderRadius: "78px",
      paddingX: 6,
      color: 'white',
      _disabled: {
        pointerEvents: "none"
      },
      _focus: {
        boxShadow: "none",
        backgroundColor: "transparent",
      },
      _hover: {
        color: "brand.500",
        backgroundColor: "transparent",
        borderColor: "brand.500"
      }
    },
    third: {
      outline: "none",
      borderRadius: "full",
      borderWidth: "1px",
      borderColor: "brand.900",
      color: "white",
      _hover: {
        color: "white",
        borderColor: "brand.500",
      },
      _active: {
        borderColor: "brand.500",
      },
      _focus: {
        boxShadow: "none",
      },
    },
    navbar: {
      outline: "none",
      color: "white",
      p: "0",
      _hover: {
        color: "brand.500",
      },
      _focus: {
        boxShadow: "none",
      },
    },
  },
};

export default button;
