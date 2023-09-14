import { FC, useEffect, useMemo, useState } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import defaultTokens from 'components/Pages/Trade/Swap/defaultTokens.json'
import useSwap from 'components/Pages/Trade/Swap/hooks/useSwap'
import { tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import SwapForm from 'components/Pages/Trade/Swap/SwapForm'
import SwapSettings from 'components/Pages/Trade/Swap/SwapSettings'
import { useChains2 } from 'hooks/useChainInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TokenItemState } from 'types/index'

type SwapProps = {
  /* Will be used if provided on first render instead of internal state */
  initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = (params) => {
  const router = useRouter()
  const [[tokenA, tokenB], setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenSwapAtom)
  const [reverse, setReverse] = useState<boolean>(false)
  const [resetForm, setResetForm] = useState<boolean>(false)

  const { chainId, address, network, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const chains: Array<any> = useChains2()
  const { tx, simulated, state, path, minReceive } = useSwap({ reverse })
  const { data: poolList } = usePoolsListQuery()
  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainId = currentChain?.label.toLowerCase()

  const changeUrl = (tokenSymbol1:string, tokenSymbol2:string) => {
    if (tokenSymbol1 && tokenSymbol2) {
      const url = `/${currentChainId}/swap?from=${tokenSymbol1}&to=${tokenSymbol2}`
      router.push(url)
    }
  }

  const tokenList = useMemo(() => {
    let listObj = {}
    const { pools = [] } = poolList || {}
    pools.
      map(({ pool_assets }) => pool_assets).
      map(([a, b]) => {
        listObj = { ...listObj,
          [a.symbol]: a,
          [b.symbol]: b }
      })

    return Object.keys(listObj).map((row) => ({
      symbol: listObj[row].symbol,
      decimals: listObj[row].decimals,
      amount: 0,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolList, chainId])
  const lowerTokenSymbols = []
  const tokenSymbols = []
  useMemo(() => tokenList.forEach((token) => {
    tokenSymbols.push(token.symbol); lowerTokenSymbols.push(token.symbol.toLowerCase())
  }),
  [tokenList])

  useEffect(() => {
    if ((!chainId && !currentChainId) || tokenList.length === 0) {
      return
    }
    // Const { from, to } = router.query
    const from = params?.initialTokenPair ? params?.initialTokenPair[0] : router.query[0]
    const to = params?.initialTokenPair ? params?.initialTokenPair[1] : router.query[1]
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
    if (!from || !to) {
      if (tokenA.tokenSymbol && tokenB.tokenSymbol && lowerTokenSymbols.includes(tokenA.tokenSymbol.toLowerCase()) && lowerTokenSymbols.includes(tokenB.tokenSymbol.toLowerCase())) {
        changeUrl(tokenA.tokenSymbol, tokenB.tokenSymbol)
        newState = [
          {
            tokenSymbol: String(tokenA.tokenSymbol),
            amount: 0,
            decimals: 6,
          },
          {
            tokenSymbol: String(tokenB.tokenSymbol),
            amount: 0,
            decimals: 6,
          },
        ]
        setResetForm(true)
        setTokenSwapState(newState)
      } else {
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
        changeUrl(defaultFrom.tokenSymbol, defaultTo.tokenSymbol)
        setTokenSwapState(newState)
        setResetForm(true)
      }
    } else if (lowerTokenSymbols.includes(String(from).toLowerCase()) && lowerTokenSymbols.includes(String(to).toLowerCase())) {
      newState = [
        {
          tokenSymbol: String(tokenSymbols[lowerTokenSymbols.indexOf(String(from).toLowerCase())]),
          amount: 0,
          decimals: 6,
        },
        {
          tokenSymbol: String(tokenSymbols[lowerTokenSymbols.indexOf(String(to).toLowerCase())]),
          amount: 0,
          decimals: 6,
        },
      ]
      setTokenSwapState(newState)
    } else {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, currentChainId, tokenList])

  const clearForm = (reset) => {
    setTokenSwapState([
      { ...tokenA,
        amount: 0 },
      { ...tokenB,
        amount: 0 },
    ])
    changeUrl(tokenA.tokenSymbol, tokenB.tokenSymbol)
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
    changeUrl(newState[0].tokenSymbol, newState[1].tokenSymbol)
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
    changeUrl(tokenB.tokenSymbol, tokenA.tokenSymbol)
    setTokenSwapState([A, B])
  }

  return (
    <VStack
      width={{ base: '100%',
        md: '650px' }}
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
