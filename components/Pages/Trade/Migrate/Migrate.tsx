import { useEffect, useMemo, useState } from 'react'

import { Box, Button, Divider, Heading, Text, useMediaQuery, VStack } from '@chakra-ui/react' // Ensure you import Button if not already
import { useChain } from '@cosmos-kit/react-lite'
import DepositForm from 'components/Pages/Trade/Liquidity/DepositForm'
import useProvideLP from 'components/Pages/Trade/Liquidity/hooks/useProvideLP'
import { useFetchStaked } from 'components/Pages/Trade/Migrate/hooks/useFetchStaked'
import useMigrateTx from 'components/Pages/Trade/Migrate/hooks/useMigrateTx'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  PoolEntityTypeWithLiquidity,
  useQueryPoolsLiquidity,
} from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { useClients } from 'hooks/useClients'
import { useQueriesDataSelector } from 'hooks/useQueriesDataSelector'
import { useTokenList } from 'hooks/useTokenList'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { tokenItemState } from 'state/tokenItemState'
import { TokenItemState, TxStep } from 'types/index'
import { getDecimals } from 'util/conversion/index'

const Migrate = () => {
  const { walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, address, openView } = useChain(walletChainName)
  const [isMobile] = useMediaQuery('(max-width: 720px)')
  const data = useFetchStaked(address)
  const { submit } = useMigrateTx()
  const ampLp = useMemo(() => data?.ampLpToken, [data])
  const erisLp = useMemo(() => data?.erisLpToken, [data])
  const wwLp = useMemo(() => data?.wwLpToken, [data])

  const lpTokens = [wwLp, erisLp, ampLp]
  const lpSum = lpTokens.reduce((acc, token) => acc + (token?.amount ?? 0), 0)
  // States required for DepositForm:
  const [reverse, setReverse] = useState(false)
  const clearForm = () => {}
  const chainId = 'phoenix-1'

  const { data: poolData } = usePoolsListQuery()
  const { cosmWasmClient } = useClients(walletChainName)

  const [pools]: readonly [PoolEntityTypeWithLiquidity[], boolean, boolean] =
    useQueriesDataSelector(useQueryPoolsLiquidity({
      refetchInBackground: false,
      pools: poolData?.pools,
      cosmWasmClient,
    }))

  const pool = useMemo(() => pools?.find((p) => p.pool_id === 'USDC-USDt'), [pools])
  const [tokenList] = useTokenList()
  const [isTokenSet, setIsToken] = useState<boolean>(false)

  const [[tokenA, tokenB], setTokenItemState] = useRecoilState(tokenItemState)

  useEffect(() => {
    if (pool?.pool_id) {
      const [tokenASymbol, tokenBSymbol] = pool?.pool_id?.split('-') || []
      setTokenItemState([
        {
          tokenSymbol: tokenASymbol,
          amount: 0,
          decimals: getDecimals(tokenASymbol, tokenList),
        },
        {
          tokenSymbol: tokenBSymbol,
          amount: 0,
          decimals: getDecimals(tokenBSymbol, tokenList),
        },
      ])
      setIsToken(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  const [bondingDays, setBondingDays] = useState(0)
  const { simulated, tx } = useProvideLP({
    reverse,
    bondingDays,
    isEris: true,
  })

  const onInputChange = ({ tokenSymbol, amount }: any, index: number) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      tx.reset()
    }

    const newState: [TokenItemState?, TokenItemState?] = [tokenA, tokenB]
    newState[index] = {
      ...newState.find((item) => item?.tokenSymbol === tokenSymbol),
      tokenSymbol,
      amount: Number(amount),
    }
    setTokenItemState(newState)
  }

  // Example button usage snippet:
  const PrimaryButton = ({
    label,
    onClick,
    isLoading = false,
    isDisabled = false,
  }: {
    label: string
    onClick?: () => void
    isLoading?: boolean
    isDisabled?: boolean
  }) => (
    <Button
      type="button"
      width="full"
      variant="primary"
      isLoading={isLoading}
      isDisabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </Button>
  )

  return (
    <VStack spacing={10} width="full" p={5} alignItems="center">
      <Box
        bg="transparent"
        p={6}
        rounded="md"
        w={isMobile ? '100%' : '60%'}
        boxShadow="xl"
        borderRadius={10}
        border="1px solid white"
      >
        <VStack spacing={8} alignItems="flex-start" width="full">
          <Heading fontSize="2xl" fontWeight="bold" color="white">
            Migrate Liquidity to New USDC/USDT Pool
          </Heading>

          <Divider borderColor="gray.600" />

          {/* Step 1 */}
          <VStack align="flex-start" width="full">
            <Heading fontSize="lg" color="white">Step 1: Check Old Pool Liquidity</Heading>
            {lpTokens.map((token, index) => {
              const tokenAmount = token?.amount ?? 0
              if (index === 0 && tokenAmount > 0) {
                return <Text key={`liq-${index}`} color="gray.200">You have {tokenAmount.toFixed(6)} WhiteWhale LP tokens in the old USDC/USDT XYK pool.</Text>
              } else if (index === 1 && tokenAmount > 0) {
                return <Text key={`liq-${index}`} color="gray.200">You have {tokenAmount.toFixed(6)} Eris LP tokens in the old USDC/USDT XYK pool.</Text>
              } else if (index === 2 && tokenAmount > 0) {
                return <Text key={`liq-${index}`} color="gray.200">You have {tokenAmount.toFixed(6)} Eris ampLP tokens in the old USDC/USDT XYK pool.</Text>
              } else {
                return <></>
              }
            })}
            {lpSum === 0 && (
              <Text color="gray.200">You have no liquidity in the old pool.</Text>
            )}
          </VStack>

          <Divider borderColor="gray.600" />

          {/* Step 2 */}
          <VStack align="flex-start" width="full">
            <Heading fontSize="lg" color="white">Step 2: Withdraw Liquidity</Heading>
            <Text color="gray.200">Withdraw all liquidity from the old XYK pool before migrating.</Text>
            <PrimaryButton
              isDisabled={!(isWalletConnected && (lpSum > 0)) }
              label={isWalletConnected && (lpSum > 0) ? 'Withdraw' : 'Nothing to withdraw'}
              onClick={() => submit(lpTokens)}
            />
          </VStack>

          <Divider borderColor="gray.600" />

          {/* Step 3 */}
          <VStack align="flex-start" width="full">
            <Heading fontSize="lg" color="white">Step 3: Deposit into the New StableSwap Pool</Heading>
            <Text color="gray.200">Now deposit your USDC and USDT into the new StableSwap pool.</Text>
            <DepositForm
              setBondingDays={setBondingDays}
              bondingDays={bondingDays}
              setReverse={setReverse}
              reverse={reverse}
              isWalletConnected={isWalletConnected}
              tokenA={tokenA}
              tokenB={tokenB}
              onInputChange={onInputChange}
              simulated={simulated}
              tx={tx}
              clearForm={clearForm}
              chainId={chainId}
              poolId={'USDC-USDt'}
              mobile={isMobile}
              openView={openView}
              incentivesEnabled={false}
            />
          </VStack>

          <Divider borderColor="gray.600" />

          {/* Step 4 */}
          <VStack align="flex-start" width="full">
            <Heading fontSize="lg" color="white">Step 4: Vote with Your Liquidity</Heading>
            <Text color="gray.200">Your new liquidity is now deposited in the StableSwap pool.</Text>
            <Text color="gray.200">Proceed to Eris Protocol to deposit your USDC/USDT Stable LP and adjust your VP to the new stable pool.</Text>
            <Button
              as="a"
              href="https://www.erisprotocol.com/terra/liquidity-hub?tab=vote"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              width="full"
            >
              Go to Eris Protocol
            </Button>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  )
}

export default Migrate
