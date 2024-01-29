import { useEffect, useMemo } from 'react'

import {
  Box,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { BondingTokenState } from 'components/Pages/Bonding/BondingActions/Bond'
import { UnbondingData } from 'components/Pages/Bonding/hooks/getUnbonding'
import { WithdrawableInfo } from 'components/Pages/Bonding/hooks/getWithdrawable'
import { useConfig } from 'components/Pages/Bonding/hooks/useDashboardData'
import { WhaleTooltip } from 'components/Pages/Bonding/WhaleTooltip'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { useRecoilState, useRecoilValue } from 'recoil'
import { bondingState } from 'state/bondingState'
import { chainState } from 'state/chainState'
import { calculateDurationString, nanoToMilli } from 'util/conversion/timeUtil'

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
  const { walletChainName, network, chainId } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)

  const prices = usePrices()

  const whalePrice = useMemo(() => {
    // @ts-ignore
    if (prices && prices?.WHALE) {
      // @ts-ignore
      return prices?.WHALE
    }
    return 0 // Default value
  }, [prices])

  const [tokenList] = useTokenList()
  const unbondingTokens = unbondingRequests?.map((row) => {
    const tokenSymbol = tokenList.tokens.find((token) => token.denom === row.denom)?.symbol
    return {
      amount: row.amount,
      tokenSymbol,
      dollarValue: (prices?.[tokenSymbol] ?? whalePrice) * row.amount,
      timestamp: row.timestamp,
    }
  })
  const [_, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingState)

  const config = useConfig(network, chainId)

  useEffect(() => {
    if (config) {
      // eslint-disable-next-line prefer-destructuring
      const firstToken = config.bonding_tokens[0]
      setCurrentBondState({
        tokenSymbol: firstToken.symbol,
        amount: 0,
        decimals: 6,
        denom: firstToken.denom,
      })
    }
  }, [isWalletConnected, config])

  const withdrawableTokens = withdrawableInfos?.map((row) => ({
    ...row,
    dollarValue:
      (prices?.[row.tokenSymbol] ?? whalePrice) * row.amount,
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
        width={['200px', '200px', '240px']}
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
             (timeUntilUnbondingInMilli / nanoToMilli(unbondingPeriodInNano))) *
            100
          }
        />
      </VStack>
    )
  }

  return (
    <VStack spacing={5} mb={35}>
      <Stack direction={['column', 'row', 'row', 'row']} spacing={7}>
        <TokenBox label="Unbonding" tokens={unbondingTokens} />
        <TokenBox label="Withdrawable" tokens={withdrawableTokens} />
      </Stack>
      {isWalletConnected &&
        unbondingRequests &&
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
