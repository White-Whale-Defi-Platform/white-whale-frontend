import { useState } from 'react'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, Icon, Tooltip } from '@chakra-ui/react'

interface Params {iconSize?: number, description: string}

const InfoTooltip = ({ iconSize, description }: Params) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  return (
    <Tooltip
      label={
        <Box
          maxWidth="250px"
          minWidth="fit-content"
          borderRadius="10px"
          boxShadow="0px 0px 4px 4px rgba(255, 255, 255, 0.25)"
          bg="black"
          color="white"
          fontSize={14}
          p={4}
          whiteSpace="pre-wrap"
        >
          {description}
        </Box>
      }
      bg="transparent"
      hasArrow={false}
      placement="bottom"
      closeOnClick={false}
      arrowSize={0}
      isOpen={isLabelOpen}
    >
      <Icon as={InfoOutlineIcon} blockSize={iconSize || 24} color={'white'} onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}/>
    </Tooltip>
  )
}
export const IncentiveTooltip = ({ iconSize }) => (
  <InfoTooltip
    iconSize={iconSize}
    description={
      'The incentive flow creator can close their flows anytime. All unclaimed tokens will be clawed back.'
    }
  />
)
export default InfoTooltip
