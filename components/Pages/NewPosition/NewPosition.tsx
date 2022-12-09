import { useEffect, useState } from 'react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { TxStep } from 'hooks/useTransaction'
import getChainName from 'libs/getChainName'
import { NextRouter, useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import { TokenItemState, tokenLpAtom } from '../ManageLiquidity/lpAtoms'
import defaultTokens from './defaultTokens.json'
import useProvideLP from './hooks/useProvideLP'
import NewPositionForm from './NewPositionForm'

const NewPosition = () => {
  const router: NextRouter = useRouter()
  const [[tokenA, tokenB], setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenLpAtom)
  const { chainId, key, address, status } = useRecoilValue(walletState)
  const [resetForm, setResetForm] = useState(false)
  const [reverse, setReverse] = useState<boolean>(false)
  const { simulated, tx } = useProvideLP({ reverse })

  // useEffect(() => {
  //     if (address) {
  //         const [from, to] = defaultTokens[getChainName(address)]
  //         const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
  //         setTokenSwapState([from, to])
  //         setResetForm(true)
  //         router.replace(params)
  //     }
  // }, [address])

  useEffect(() => {
    const { from, to } = router.query
    if (!from && !to) {
      if (address) {
        const [defaultFrom, defaultTo] = defaultTokens[getChainName(address)]
        const params = `?from=${defaultFrom?.tokenSymbol}&to=${defaultTo?.tokenSymbol}`

        setTokenSwapState([defaultFrom, defaultTo])
        setResetForm(true)
        router.replace(params)
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
    // }, [address, from, to])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId])

  useEffect(() => {
    if (tokenA?.tokenSymbol !== null && tokenB?.tokenSymbol !== null) {
      const params = `?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
      router.replace(params, undefined, { shallow: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenA, tokenB])

  const onInputChange = (
    { tokenSymbol, amount }: TokenItemState,
    index: number
  ) => {
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
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon />}
          onClick={() => router.back()}
        />
        <Text as="h2" fontSize="24" fontWeight="900">
          New Position
        </Text>
      </HStack>

      <NewPositionForm
        setReverse={setReverse}
        reverse={reverse}
        connected={status}
        tokenA={tokenA}
        tokenB={tokenB}
        onInputChange={onInputChange}
        simulated={simulated}
        tx={tx}
        resetForm={resetForm}
        setResetForm={setResetForm}
      />
    </VStack>
  )
}

export default NewPosition
