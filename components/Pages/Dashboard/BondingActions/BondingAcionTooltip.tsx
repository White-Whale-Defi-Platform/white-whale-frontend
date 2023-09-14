import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, Icon, Tooltip } from '@chakra-ui/react'
import { ActionType } from 'components/Pages/Dashboard/BondingOverview'
import { useState } from 'react'

const bondingActionText = (action: ActionType) => {
  switch (action) {
    case ActionType.bond:
      return 'Bond tokens to earn rewards. Tokens are locked up.'
    case ActionType.unbond:
      return 'Unbonding duration of 14 days, no rewards during that period. Unable to stop or abort the process once initiated.'
    case ActionType.withdraw:
      return 'Withdrawing of tokens once unbonded.'
    case ActionType.claim:
      return (
        'Rewards fluctuate due to bonding activity.\nUnstable APR (depending on share, trading/flashloan volume, amp/bWHALE relation to WHALE etc.).\n' +
        'Time dependent multiplier, i.e. the longer you bond the more you get.\nShown APR takes multiplier into account.'
      )
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
          color="white"
          fontSize={14}
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
