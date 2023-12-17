import { useState } from 'react'

import { Text, Tooltip } from '@chakra-ui/react'

export const TooltipWithChildren = ({
  children = null,
  label = 'label',
  isHeading = false,
  fontSize = 'sm',
  showTooltip = true,
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  return (
    <Tooltip
      label={children}
      hasArrow
      px="15px"
      py="10px"
      borderRadius="5px"
      boxShadow="0px 0px 4px 4px rgba(255, 255, 255, 0.25)"
      bg="blackAlpha.900"
      maxW="330px"
      isDisabled={!showTooltip}
      isOpen={showTooltip && isLabelOpen}
    >
      <Text
        as="span"
        color={isHeading ? 'brand.50' : 'white'}
        borderBottom={
          showTooltip ? '1px dashed rgba(255, 255, 255, 0.5)' : 'none'
        }
        width="fit-content"
        fontSize={fontSize}
        textTransform="capitalize"
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}
      >
        {label}
      </Text>
    </Tooltip>
  )
}
