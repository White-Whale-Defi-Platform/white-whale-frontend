import { Text, Tooltip } from "@chakra-ui/react";

export const TooltipWithChildren = ({ children, label = "label", isHeading = false, fontSize="sm" }) => (
    <Tooltip label={children} hasArrow padding="20px" borderRadius="20px" bg="blackAlpha.900" maxW="330px">
        <Text
            as="span"
            color={isHeading ? "brand.50" : "white"}
            borderBottom="1px dashed rgba(255, 255, 255, 0.5)"
            width="fit-content"
            fontSize={fontSize}
            textTransform="capitalize"
        >
            {label}
        </Text>
    </Tooltip>
);
