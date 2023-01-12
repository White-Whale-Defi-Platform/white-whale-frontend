import { FC, useEffect, useState } from 'react'

import { HStack, Text, VStack } from '@chakra-ui/react'
import { TxStep } from 'hooks/useTransaction'
import getChainName from 'libs/getChainName'
import { fromChainAmount } from 'libs/num'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

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
  const [resetForm, setResetForm] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const { from, to } = router.query

    if (!from && !to) {
      if (address) {
        const [defaultFrom, defaultTo] = defaultTokens[getChainName(address)]
        const params = `?from=${defaultFrom?.tokenSymbol}&to=${defaultTo?.tokenSymbol}`

        setTokenSwapState([defaultFrom, defaultTo])
        router.replace(params)
        setResetForm(true)
      }
    } else {
      const newState: TokenItemState[] = [
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
      setTokenSwapState(newState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId])

  useEffect(() => {
    if (tokenA?.tokenSymbol !== null && tokenB?.tokenSymbol !== null) {
      const params = `?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
      router.replace(params, undefined, { shallow: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenA, tokenB])

  const { tx, simulated, state, path, minReceive } = useSwap({ reverse })

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
      margin="auto"
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
