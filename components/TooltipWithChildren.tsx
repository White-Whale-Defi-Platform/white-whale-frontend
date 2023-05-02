import { Text, Tooltip } from "@chakra-ui/react";

export const TooltipWithChildren = ({ children = null, label = "label", isHeading = false, fontSize="sm", showTooltip = true}) => (
    <Tooltip label={children} hasArrow px="15px" py="10px" borderRadius="5px" bg="blackAlpha.900" maxW="330px" isDisabled={!showTooltip}>
        <Text
            as="span"
            color={isHeading ? "brand.50" : "white"}
            borderBottom={showTooltip? "1px dashed rgba(255, 255, 255, 0.5)" : "none"}
            width="fit-content"
            fontSize={fontSize}
            textTransform="capitalize"
        >
            {label}
        </Text>
    </Tooltip>
);
