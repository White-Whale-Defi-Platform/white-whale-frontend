import { useState } from 'react'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, Icon, Tooltip } from '@chakra-ui/react'
import { ActionType } from 'components/Pages/Bonding/BondingOverview'

const bondingActionText = (action: ActionType) => {
  switch (action) {
    case ActionType.bond:
      return 'Bond tokens to earn rewards. Tokens are locked up.'
    case ActionType.unbond:
      return 'Unbonding duration of 1 Day, no rewards during that period. Unable to stop or abort the process once initiated.'
    case ActionType.withdraw:
      return 'Withdrawing of tokens once unbonded.'
    case ActionType.claim:
      return (
        'Rewards fluctuate due to bonding activity.\nUnstable APR (depending on share, trading/flashloan volume, amp/bWHALE relation to WHALE etc.).\n' +
        'Time dependent multiplier, i.e. the longer you bond the more you get.\nShown APR takes multiplier into account.'
      )
    default:
      return ''
  }
}

export const BondingActionTooltip = ({ action }) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false)
  return (
    <Tooltip
      label={
        <Box
          maxWidth="250px"
          minWidth="fit-content"
          borderRadius="10px"
          bg="black"
          boxShadow="0px 0px 4px 4px rgba(255, 255, 255, 0.25)"
          color="white"
          p={4}
          whiteSpace="pre-wrap"
        >
          {bondingActionText(action)}
        </Box>
      }
      bg="transparent"
      hasArrow={false}
      placement="bottom"
      closeOnClick={false}
      isOpen={isLabelOpen}
      arrowSize={0}
    >
      <Icon
        w={action === ActionType.claim ? 3 : 5}
        as={InfoOutlineIcon}
        color="white"
        cursor="pointer"
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(!isLabelOpen)}
      />
    </Tooltip>
  )
}
