import { FC, useEffect, useMemo, useState } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import defaultTokens from 'components/Pages/Trade/Swap/defaultTokens.json'
import useSwap from 'components/Pages/Trade/Swap/hooks/useSwap'
import { tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import SwapForm from 'components/Pages/Trade/Swap/SwapForm'
import SwapSettings from 'components/Pages/Trade/Swap/SwapSettings'
import { useChainInfos } from 'hooks/useChainInfo'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { TxStep, TokenItemState } from 'types/index'
import { getDecimals } from 'util/conversion/index'

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

  const { chainId, network, walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, address } = useChain(walletChainName)
  const chains: Array<any> = useChainInfos()
  const { tx, simulated, state, path, minReceive, priceImpact } = useSwap({ reverse })
  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainId = currentChain?.label.toLowerCase()

  const changeUrl = (tokenSymbol1:string, tokenSymbol2:string) => {
    if (tokenSymbol1 && tokenSymbol2) {
      const url = `/${currentChainId}/swap?from=${tokenSymbol1}&to=${tokenSymbol2}`
      router.push(url)
    }
  }

  const [tokenList] = useTokenList()

  const tokenSymbols = useMemo(() => tokenList?.tokens.map((token) => token.symbol),
    [tokenList])

  useEffect(() => {
    if (!currentChainId || tokenList?.tokens.length === 0) {
      return
    }
    const [from, to] = params?.initialTokenPair || []
    const [defaultFrom, defaultTo] = defaultTokens[network][walletChainName]
    const tokenASymbol = from || defaultFrom.tokenSymbol
    const tokenBSymbol = to || defaultTo.tokenSymbol
    let newState: TokenItemState[] = [
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
    ]
    if (!from || !to) {
      if (tokenA.tokenSymbol && tokenB.tokenSymbol) {
        changeUrl(tokenA.tokenSymbol, tokenB.tokenSymbol)
      } else {
        newState = [
          {
            tokenSymbol: defaultFrom.tokenSymbol,
            amount: 0,
            decimals: getDecimals(defaultFrom.tokenSymbol, tokenList),
          },
          {
            tokenSymbol: defaultTo.tokenSymbol,
            amount: 0,
            decimals: getDecimals(defaultTo.tokenSymbol, tokenList),
          },
        ]
        changeUrl(defaultFrom.tokenSymbol, defaultTo.tokenSymbol)
        setTokenSwapState(newState)
        setResetForm(true)
      }
    } else if (tokenSymbols?.includes(from) && tokenSymbols?.includes(to)) {
      setTokenSwapState(newState)
    } else {
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
      ...newState[index],
      tokenSymbol,
      amount: Number(amount),
    }
    setTokenSwapState(newState)
    changeUrl(newState[0].tokenSymbol, newState[1].tokenSymbol)
  }

  const onReverseDirection = () => {
    const A = {
      ...tokenB,
      amount: tokenA.amount || parseFloat(fromChainAmount(simulated?.amount, tokenA.decimals)),
    }
    const B = {
      ...tokenA,
      amount: tokenB.amount || parseFloat(fromChainAmount(simulated?.amount, tokenB.decimals)),
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
        priceImpact={priceImpact}
      />
    </VStack>
  )
}

export default Swap
