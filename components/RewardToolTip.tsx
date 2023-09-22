import { useState } from 'react'

import { Text, Tooltip } from '@chakra-ui/react'

export const RewardToolTip = ({
  children = null,
  label = 'label',
  isHeading = false,
  fontSize = 'sm',
  showTooltip = true,
  isWalletConnected = false,
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)

  return (
    <Tooltip
      label={ isWalletConnected ? children : null}
      hasArrow
      px="15px"
      py="10px"
      borderRadius="5px"
      bg="blackAlpha.900"
      maxW="330px"
      isDisabled={!showTooltip}
      isOpen={showTooltip && isLabelOpen}
    >
      <Text
        as="span"
        color={isHeading ? 'brand.50' : 'white'}
        borderBottom={
          showTooltip && isWalletConnected ? '1px dashed rgba(255, 255, 255, 0.5)' : 'none'
        }
        width="fit-content"
        fontSize={fontSize}
        textTransform="capitalize"
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}
      >
        { isWalletConnected ? label : '-'}
      </Text>
    </Tooltip>
  )
}
