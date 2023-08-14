import { FC, useEffect, useMemo, useState } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TokenItemState } from 'types'

import defaultTokens from './defaultTokens.json'
import useSwap from './hooks/useSwap'
import { tokenSwapAtom } from './swapAtoms'
import SwapForm from './SwapForm'
import SwapSettings from './SwapSettings'
import { useChain } from '@cosmos-kit/react-lite'

type SwapProps = {
  /* Will be used if provided on first render instead of internal state */
  initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({}) => {
  const [[tokenA, tokenB], setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenSwapAtom)
  const [reverse, setReverse] = useState<boolean>(false)
  const [resetForm, setResetForm] = useState<boolean>(false)

  const { chainId, address, network, chainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(chainName)
  const chains: Array<any> = useChains()
  const { tx, simulated, state, path, minReceive } = useSwap({ reverse })
  const { data: poolList } = usePoolsListQuery()
  const router = useRouter()
  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainId = currentChain?.label.toLowerCase()

  const tokenList = useMemo(() => {
    let listObj = {}
    const { pools = [] } = poolList || {}
    pools
      .map(({ pool_assets }) => pool_assets)
      .map(([a, b]) => {
        listObj = { ...listObj, [a.symbol]: a, [b.symbol]: b }
      })

    return Object.keys(listObj).map((row) => ({
      symbol: listObj[row].symbol,
      decimals: listObj[row].decimals,
      amount: 0,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolList, chainId])

  const tokenSymbols = useMemo(
    () => tokenList.map((token) => token.symbol),
    [tokenList]
  )

  useEffect(() => {
    if (!currentChainId) {
      return
    }
    const { from, to } = router.query
    const [defaultFrom, defaultTo] = defaultTokens[network][currentChainId]

    let newState: TokenItemState[] = [
      {
        tokenSymbol: String(from),
        amount: 0,
        decimals: 6,
      },
      {
        tokenSymbol: String(to),
        amount: 0,
        decimals: 6,
      },
    ]
    if (tokenSymbols.includes(from) && tokenSymbols.includes(to)) {
      return
    }
    newState = [
      {
        tokenSymbol: String(defaultFrom.tokenSymbol),
        amount: 0,
        decimals: 6,
      },
      {
        tokenSymbol: String(defaultTo.tokenSymbol),
        amount: 0,
        decimals: 6,
      },
    ]
    setResetForm(true)

    setTokenSwapState(newState)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, currentChainId, tokenList])

  useEffect(() => {
    if (!currentChainId) {
      return
    }

    if (tokenA?.tokenSymbol !== null && tokenB?.tokenSymbol !== null) {
      if (
        tokenSymbols.includes(tokenA.tokenSymbol) &&
        tokenSymbols.includes(tokenB.tokenSymbol)
      ) {
        const url = `/${currentChainId}/swap?from=${tokenA.tokenSymbol}&to=${tokenB.tokenSymbol}`
        router.push(url)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenA, tokenB])

  const clearForm = (reset) => {
    setTokenSwapState([
      { ...tokenA, amount: 0 },
      { ...tokenB, amount: 0 },
    ])
    setResetForm(reset)
  }

  const onInputChange = ({ tokenSymbol, amount }, index: number) => {
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success) {
      tx.reset()
    }

    const newState: TokenItemState[] = [tokenA, tokenB]
    newState[index] = {
      tokenSymbol,
      amount: Number(amount),
      decimals: 6,
    }
    setTokenSwapState(newState)
  }

  const onReverseDirection = () => {
    const A = {
      ...tokenB,
      amount: tokenA.amount || parseFloat(fromChainAmount(simulated?.amount)),
    }
    const B = {
      ...tokenA,
      amount: tokenB.amount || parseFloat(fromChainAmount(simulated?.amount)),
    }

    setTokenSwapState([A, B])
  }

  return (
    <VStack
      width={{ base: '100%', md: '650px' }}
      alignItems="center"
      padding={5}
      margin="0px auto"
    >
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}
        paddingX={{ base: 4 }}
      >
        <Text as="h2" fontSize="24" fontWeight="900">
          Swap
        </Text>
        <SwapSettings />
      </HStack>
      <SwapForm
        isWalletConnected={isWalletConnected}
        tokenA={tokenA}
        tokenB={tokenB}
        onReverseDirection={onReverseDirection}
        onInputChange={onInputChange}
        simulated={simulated}
        minReceive={minReceive}
        isReverse={reverse}
        tx={tx}
        state={state}
        setReverse={setReverse}
        resetForm={resetForm}
        setResetForm={clearForm}
        path={path}
      />
    </VStack>
  )
}

export default Swap
