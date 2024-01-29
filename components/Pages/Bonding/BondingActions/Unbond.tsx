import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useMediaQuery, VStack } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import AssetInput from 'components/AssetInput/index'
import { BondingTokenState, TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { BondedData } from 'components/Pages/Bonding/hooks/getBonded';
import { useConfig } from 'components/Pages/Bonding/hooks/useDashboardData';
import { useRecoilState, useRecoilValue } from 'recoil'
import { bondingState } from 'state/bondingState'
import { chainState } from 'state/chainState'

const Unbond = ({ bondedAssets }: { bondedAssets: BondedData[] }) => {
  const { walletChainName, network, chainId } = useRecoilValue(chainState)
  const { isWalletConnected } = useChain(walletChainName)
  const [isMobile] = useMediaQuery('(max-width: 720px)')
  const [currentBondState, setCurrentBondState] =
    useRecoilState<BondingTokenState>(bondingState)
  const config = useConfig(network, chainId)
  const [bondedBalances, setBondedBalances] = useState<TokenBalance[]>(null)

  useEffect(() => {
    const newBalances = bondedAssets?.map((asset: BondedData) => ({ amount: asset.amount,
      tokenSymbol: asset.tokenSymbol }))
    setBondedBalances(newBalances)
  }, [bondedAssets])

  const onInputChange = useCallback((tokenSymbol: string | null, amount: number) => {
    if (tokenSymbol) {
      setCurrentBondState({
        ...currentBondState,
        tokenSymbol,
        amount: Number(amount),
      })
    } else {
      setCurrentBondState({ ...currentBondState,
        amount: Number(amount) })
    }
  },
  [currentBondState])

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

  const { control } = useForm({
    mode: 'onChange',
    defaultValues: {
      currentBondState,
    },
  })

  const currentTokenBalance = useMemo(() => bondedBalances?.find((balance) => balance.tokenSymbol === currentBondState.tokenSymbol)?.amount,
    [bondedBalances, currentBondState.tokenSymbol])

  return (
    <VStack px={7} width="full">
      <Controller
        name="currentBondState"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            mobile={isMobile}
            isBonding={true}
            unbondingBalances={bondedBalances}
            hideToken={currentBondState.tokenSymbol}
            {...field}
            token={currentBondState}
            balance={currentTokenBalance}
            hideHalfMax={false}
            disabled={false}
            onChange={(value, isTokenChange) => {
              onInputChange(value, 0)
              field.onChange(value)
              if (isTokenChange) {
                setCurrentBondState({
                  ...currentBondState,
                  tokenSymbol: value.tokenSymbol,
                  amount: value.amount,
                })
              } else {
                setCurrentBondState({
                  ...currentBondState,
                  amount: value.amount,
                })
              }
            }}
          />
        )}
      />
    </VStack>
  )
}

export default Unbond
