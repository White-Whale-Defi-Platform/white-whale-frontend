import {useEffect, useMemo, useState} from 'react'

import {ArrowBackIcon} from '@chakra-ui/icons'
import {HStack, IconButton, Text, VStack} from '@chakra-ui/react'
import {useChains} from 'hooks/useChainInfo'
import {TxStep} from 'hooks/useTransaction'
import {NextRouter, useRouter} from 'next/router'
import {usePoolsListQuery} from 'queries/usePoolsListQuery'
import {useRecoilState, useRecoilValue} from 'recoil'
import {walletState} from 'state/atoms/walletAtoms'

import {TokenItemState, tokenLpAtom} from '../ManageLiquidity/lpAtoms'
import defaultTokens from './defaultTokens.json'
import useProvideLP from './hooks/useProvideLP'
import NewPositionForm from './NewPositionForm'

const NewPosition = () => {
  const [resetForm, setResetForm] = useState(false)
  const [reverse, setReverse] = useState<boolean>(false)

  const [[tokenA, tokenB], setTokenSwapState] =
    useRecoilState<TokenItemState[]>(tokenLpAtom)
  const {chainId, network, address, status} = useRecoilValue(walletState)
  const {simulated, tx} = useProvideLP({reverse})
  const router: NextRouter = useRouter()
  const chains: Array<any> = useChains()
  const {data: poolList} = usePoolsListQuery()


  const chainIdParam = router.query.chainId as string
  const {from, to} = router.query
  const currentChain = chains.find((row) => row.chainId === chainId)
  const currentChainId = currentChain?.label.toLowerCase()

  const tokenList = useMemo(() => {
    let listObj = {}
    const {pools = []} = poolList || {}
    pools
      .map(({pool_assets}) => pool_assets)
      .map(([a, b]) => {
        listObj = {...listObj, [a.symbol]: a, [b.symbol]: b}
      })

    return Object.keys(listObj).map((row) => {
      return {
        symbol: listObj[row].symbol,
        decimals: listObj[row].decimals,
        amount: 0,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolList, chainId])

  useEffect(() => {
    if (!currentChainId) return

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

    if (
      tokenList.find((row) => row.symbol === from) &&
      tokenList.find((row) => row.symbol === to)
    ) {
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
    }

    setTokenSwapState(newState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId])

  useEffect(() => {
    if (!currentChainId) return

    if (tokenA?.tokenSymbol !== null && tokenB?.tokenSymbol !== null) {
      if (
        tokenList.find((row) => row.symbol === tokenA?.tokenSymbol) &&
        tokenList.find((row) => row.symbol === tokenB?.tokenSymbol)
      ) {
        const url = `/${currentChainId}/pools/new_position?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
        router.push(url)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenA, tokenB])

  const onInputChange = (
    {tokenSymbol, amount}: TokenItemState,
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
      width={{base: '100%', md: '600px'}}
      alignItems="center"
      padding={5}
      // margin="auto"
    >
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}
        paddingX={{base: 4}}
      >
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon/>}
          onClick={() => router.push(`/${chainIdParam}/pools`)}
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
