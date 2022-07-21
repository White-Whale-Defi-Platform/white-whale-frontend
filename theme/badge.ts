import { transparentize } from "@chakra-ui/theme-tools";

function variantBrand(props: Record<string, any>) {
  const { colorScheme: c } = props;
  return {
    bg: transparentize(`${c}.500`, 0.2),
    color: `${c}.500`,
  };
}

export default {
  baseStyle: {
    fontSize: "sm",
    px: "4",
    py: "2",
    borderRadius: "full",
    textTransform: "none",
  },
  variants: {
    brand: variantBrand,
  },
};
