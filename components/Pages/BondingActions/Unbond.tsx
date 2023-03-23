import React, {useEffect, useState} from 'react'
import { VStack } from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {bondingSummaryState, BondingSummaryStatus} from "../../../state/atoms/bondingAtoms";
import {useRecoilState, useResetRecoilState} from "recoil";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {TokenItemState} from "../../../types";
import {bondingAtom} from "./bondAtoms";
import {Controller, useForm} from "react-hook-form";
import {useUnbonding} from "../Bonding/hooks/useUnbonding";
import {useBonded} from "../Bonding/hooks/useBonded";
import {useBondingConfig} from "../Bonding/hooks/useBondingConfig";

const Unbond = ()  => {

  const [isLoading, setLoading] = useState<boolean>(true)
  const [currentBondingSummaryState, setCurrentBondingSummaryState] = useRecoilState(bondingSummaryState)
  const [{client, address, status}, _] = useRecoilState(walletState)

  const isWalletConnected = status === WalletStatusType.connected

  const [currentBondState, setCurrentBondState] = useRecoilState<TokenItemState>(bondingAtom)
  const resetExampleAtom = useResetRecoilState(bondingAtom);

  useEffect(() => {
    return () => {
      setCurrentBondState({...currentBondState,amount:0});
    };
  }, [resetExampleAtom]);

  const [token, setToken] = useState({
    amount: currentBondingSummaryState.bondedAmpWhale,
    tokenSymbol: "WHALE",
    decimals: 6,
  })
  const [liquidAmpWhale, setLiquidAmpWhale] = useState<number>(null)

  const {bondingConfig} = useBondingConfig(client)
  console.log("bondingConfig?.unbonding_period")
  console.log(bondingConfig?.unbonding_period)

  const unbondingPeriodInNano = Number(bondingConfig?.unbonding_period)*1_000_000_000 ?? 60*1_000_000_000

  const { bondedAmpWhale, bondedBWhale, refetch} = useBonded(client, address)
  const {unbondingAmpWhale, unbondingBWhale} = useUnbonding(client, address, ["uwhale", "ibc"])



  const [liquidBWhale, setLiquidBWhale] = useState<number>(null)
  const [withdrawableAmpWhale, setWithdrawableAmpWhale] = useState<number>(null)
  const [withdrawableBWhale, setWithdrawableBWhale] = useState<number>(null)
  useEffect(() => {

    async function fetchLSDInfo() {
      setLiquidBWhale(liquidBWhale)
      setWithdrawableAmpWhale(4637)
      setWithdrawableBWhale(8383)
    }

    if (currentBondingSummaryState.status === BondingSummaryStatus.uninitialized && isWalletConnected) {
      fetchLSDInfo().then(_=>{
        setCurrentBondingSummaryState({
        status: BondingSummaryStatus.available,
          unbondingPeriod: unbondingPeriodInNano,
        edgeTokenList: ["WHALE", "bWHALE"],
        liquidAmpWhale: liquidAmpWhale,
        liquidBWhale:liquidBWhale,
        bondedAmpWhale: bondedAmpWhale,
        bondedBWhale: bondedBWhale,
        unbondingAmpWhale: unbondingAmpWhale,
        unbondingBWhale: unbondingBWhale,
        withdrawableAmpWhale: withdrawableAmpWhale,
        withdrawableBWhale: withdrawableBWhale,
      })})

    } else {
      setLiquidAmpWhale(currentBondingSummaryState.liquidAmpWhale)
      setLiquidBWhale(currentBondingSummaryState.liquidBWhale)
      setWithdrawableAmpWhale(currentBondingSummaryState.withdrawableAmpWhale)
      setWithdrawableBWhale(currentBondingSummaryState.withdrawableBWhale)
    }
    const newState: TokenItemState = {
      tokenSymbol: token.tokenSymbol,
      amount: 0,
      decimals: 6,
    }
    setCurrentBondState(newState)
    setLoading(false)
  }, [isWalletConnected])

  const onInputChange = ( tokenSymbol: string | null , amount: number) => {

    const newState: TokenItemState = {
      tokenSymbol: tokenSymbol ?? token.tokenSymbol,
      amount: Number(amount),
      decimals: 6,
    }
    setCurrentBondState(newState)
  }
  const { control } = useForm({
    mode: 'onChange',
    defaultValues: {
      currentBondState
    },
  })

    return <VStack
        px={7}
        width="full">
      <Controller
        name="currentBondState"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <AssetInput
            hideToken={token?.tokenSymbol}
            {...field}
            token={currentBondState}
            balance={(bondedAmpWhale+bondedBWhale)}
            minMax={false}
            // onInputFocus={() => setIsReverse(true)}
            disabled={false}
            onChange={(value, isTokenChange) => {
              onInputChange(value, 0)
              field.onChange(value)
              setCurrentBondState({...token, amount: value.amount})

            }}
          />)}/>
    </VStack>

}

export default Unbond
