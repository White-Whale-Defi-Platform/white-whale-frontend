import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, Icon, Tooltip } from '@chakra-ui/react'

const InfoTooltip = ({ iconSize, description }) => (
  <Tooltip
    label={
      <Box
        maxWidth="250px"
        minWidth="fit-content"
        borderRadius="10px"
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
  >
    <Icon as={InfoOutlineIcon} blockSize={iconSize} color={'white'} />
  </Tooltip>
)
export const IncentiveTooltip = ({ iconSize }) => (
  <InfoTooltip
    iconSize={iconSize}
    description={
      'The incentive flow creator can close their flows anytime. All unclaimed tokens will be clawed back.'
    }
  />
)
export default InfoTooltip
