import { FC, useEffect, useState, useMemo } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { TxStep } from 'hooks/useTransaction'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'

import defaultTokens from './defaultTokens.json'
import useSwap from './hooks/useSwap'
import { TokenItemState, tokenSwapAtom } from './swapAtoms'
import SwapForm from './SwapForm'
import SwapSettings from './SwapSettings'

type SwapProps = {
  /* will be used if provided on first render instead of internal state */
  initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({}) => {
  const [[tokenA, tokenB], setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenSwapAtom)
  const [reverse, setReverse] = useState<boolean>(false)
  const { chainId, address, key, status } = useRecoilValue(walletState)
  const chains = useChains()
  const { data: poolList } = usePoolsListQuery()

  const [resetForm, setResetForm] = useState<boolean>(false)
  const router = useRouter()
  const currenChain = chains.find((row) => row.chainId === chainId)
  const currentChainId = currenChain?.label.toLowerCase()
  const { tx, simulated, state, path, minReceive } = useSwap({ reverse })
  const chainIdParam = router.query.chainId as string

  const tokenList = useMemo(() => {
    let listObj = {}
    const { pools = [] } = poolList || {}
    pools
      .map(({ pool_assets }) => pool_assets)
      .map(([a, b]) => {
        listObj = { ...listObj, [a.symbol]: a, [b.symbol]: b }
      })

    return Object.keys(listObj).map((row) => {
      return {
        symbol: listObj[row].symbol,
        decimals: listObj[row].decimals,
        amount: 0,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolList])

  useEffect(() => {
    if (!currentChainId) return
    const { from, to } = router.query

    if (!from && !to) {
      const [defaultFrom, defaultTo] = defaultTokens[currentChainId]
      const params = `?from=${defaultFrom?.tokenSymbol}&to=${defaultTo?.tokenSymbol}`
      const url = `/${currentChainId}/swap${params}`

      setTokenSwapState([defaultFrom, defaultTo])
      setResetForm(true)
      router.push(url)
    } else {
      const [defaultFrom, defaultTo] = defaultTokens[currentChainId]

      // let newState: TokenItemState[]

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

      if (
        tokenList.find((row) => row.symbol === from) &&
        tokenList.find((row) => row.symbol === to)
      ) {
        return
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
      }

      setTokenSwapState(newState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, currentChainId, tokenList])

  useEffect(() => {
    if (!currentChainId) return

    if (
      chainIdParam &&
      tokenA?.tokenSymbol !== null &&
      tokenB?.tokenSymbol !== null
    ) {
      const url = `/${currentChainId}/swap?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
      router.push(url)
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
    if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
      tx.reset()

    const newState: TokenItemState[] = [tokenA, tokenB]
    newState[index] = {
      tokenSymbol: tokenSymbol,
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
      width={{ base: '100%', md: '600px' }}
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
        connected={status}
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
