import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import { WalletStatusType, walletState } from 'state/atoms/walletAtoms'
import {
  calculateDurationString,
  convertMicroDenomToDenom,
  nanoToMilli,
} from 'util/conversion'

import { WhaleTooltip } from '../Dashboard/WhaleTooltip'
import usePrices from 'hooks/usePrices'
import { UnbondingData } from 'components/Pages/Dashboard/hooks/getUnbonding'
import { useTokenList } from 'hooks/useTokenList'
import { WithdrawableInfo } from 'components/Pages/Dashboard/hooks/getWithdrawable'
import { useMemo } from 'react'

type Props = {
  unbondingRequests: UnbondingData[]
  withdrawableInfos: WithdrawableInfo[]
  unbondingPeriodInNano: number
}
const Withdraw = ({
  unbondingRequests,
  withdrawableInfos,
  unbondingPeriodInNano,
}: Props) => {
  const { status } = useRecoilValue(walletState)
  const prices = usePrices()

  const whalePrice = useMemo(() => {
    // @ts-ignore
    if (prices && prices?.WHALE) {
      // @ts-ignore
      return prices?.WHALE
    }
    return 0 // Default value
  }, [prices])

  const isWalletConnected = status === WalletStatusType.connected
  const [tokenList, _] = useTokenList()
  const unbondingTokens = unbondingRequests?.map((row) => {
    const tokenSymbol = tokenList.tokens.find(
      (token) => token.denom === row.denom
    )?.symbol
    return {
      amount: row.amount,
      tokenSymbol: tokenSymbol,
      dollarValue: (prices?.[tokenSymbol] ?? whalePrice) * row.amount,
      timestamp: row.timestamp,
    }
  })
  const withdrawableTokens = withdrawableInfos?.map((row) => ({
    ...row,
    dollarValue:
      (prices?.[row.tokenSymbol] ?? whalePrice) *
      convertMicroDenomToDenom(row.amount, 6),
  }))

  const ProgressBar = ({ percent }) => (
    <Box
      h="3px"
      minW={450}
      bg="whiteAlpha.400"
      borderRadius="10px"
      overflow="hidden"
    >
      <Box h="100%" bg="#7CFB7D" w={`${percent}%`} borderRadius="10px" />
    </Box>
  )

  const TokenBox = ({ label, tokens }) => {
    const dollarValue = tokens?.reduce((acc, cur) => acc + cur.dollarValue, 0)
    return (
      <Box
        border="0.5px solid"
        borderColor="whiteAlpha.400"
        borderRadius="10px"
        p={4}
        minW={240}
      >
        <WhaleTooltip
          label={label}
          tokens={tokens}
          isWalletConnected={isWalletConnected}
        />
        <Text mb="-0.2rem" fontSize={23} fontWeight="bold">
          {isWalletConnected ? `$${dollarValue.toLocaleString()}` : 'n/a'}
        </Text>
      </Box>
    )
  }

  const BoxComponent = ({ tokenSymbol, amount, timeUntilUnbondingInMilli }) => {
    const durationString = calculateDurationString(timeUntilUnbondingInMilli)
    return (
      <VStack justifyContent="center" alignItems="center" mb={30}>
        <HStack
          justifyContent="space-between"
          alignItems="flex-start"
          w="100%"
          px={4}
        >
          <Text>
            {amount.toLocaleString()} {tokenSymbol}
          </Text>
          <HStack spacing={4}>
            <Text>~ {durationString}</Text>
          </HStack>
        </HStack>
        <ProgressBar
          percent={
            (1 -
              timeUntilUnbondingInMilli / nanoToMilli(unbondingPeriodInNano)) *
            100
          }
        />
      </VStack>
    )
  }

  return (
    <VStack spacing={5} mb={35}>
      <HStack spacing={7}>
        <TokenBox label="Unbonding" tokens={unbondingTokens} />
        <TokenBox label="Withdrawable" tokens={withdrawableTokens} />
      </HStack>
      {isWalletConnected &&
        unbondingRequests !== null &&
        unbondingRequests?.length > 0 && (
          <Box
            overflowY="scroll"
            maxHeight={340}
            minW={510}
            backgroundColor="black"
            padding="4"
            borderRadius="10px"
            mt={10}
          >
            {unbondingTokens.map((token, index) => {
              const currentTimeInMilli = Date.now()
              const timeUntilUnbondingInMilli =
                nanoToMilli(Number(token.timestamp) + unbondingPeriodInNano) -
                currentTimeInMilli
              return (
                <BoxComponent
                  key={index}
                  tokenSymbol={token.tokenSymbol}
                  amount={token.amount}
                  timeUntilUnbondingInMilli={timeUntilUnbondingInMilli}
                />
              )
            })}
          </Box>
        )}
    </VStack>
  )
}

export default Withdraw
