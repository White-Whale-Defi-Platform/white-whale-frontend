import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, Icon, Tooltip } from '@chakra-ui/react'

const InfoTooltip = ({ IconSize, description }) => (
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
    <Icon as={InfoOutlineIcon} blockSize={IconSize} color={'white'} />
  </Tooltip>
)
export const IncentiveTooltip = ({ IconSize }) => (
  <InfoTooltip
    IconSize={IconSize}
    description={
      'The Incentive Flow Creator can close their flows anytime after the set timeframe. All unclaimed tokens will be clawed back. '
    }
  />
)
export default InfoTooltip
