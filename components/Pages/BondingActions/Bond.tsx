import React, {useEffect, useState} from 'react'
import { VStack} from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {useRecoilState} from "recoil";
import {bondingSummaryState, BondingSummaryStatus} from "../../../state/atoms/bondingAtoms";
import {useTokenBalance} from "../../../hooks/useTokenBalance";
import {bondingAtom} from "./bondAtoms";
import {TokenItemState} from "../../../types";
import {Controller, useForm} from "react-hook-form";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {useBondingConfig} from "../Bonding/hooks/useBondingConfig";

const Bond = () => {

  const [isLoading, setLoading] = useState<boolean>(true)
  const [currentBondingSummaryState, setCurrentBondingSummaryState] = useRecoilState(bondingSummaryState)
  const [currentBondState, setCurrentBondState] = useRecoilState<TokenItemState>(bondingAtom)
  const [{status, client}, _] = useRecoilState(walletState)


  const isWalletConnected = status === WalletStatusType.connected

  const [token, setToken] = useState({
    amount: currentBondingSummaryState.bondedAmpWhale,
    tokenSymbol: "WHALE",
    decimals: 6,
  })

  const [liquidAmpWhale, setLiquidAmpWhale] = useState<number>(null)

    const {balance: liquidWhale} = useTokenBalance(
      "WHALE")

  const {bondingConfig} = useBondingConfig(client)

  const unbondingPeriod = bondingConfig?.unbonding_period

  const [liquidBWhale, setLiquidBWhale] = useState<number>(null)
  const [bondedAmpWhale, setBondedAmpWhale] = useState<number>(null)
  const [bondedBWhale, setBondedBWhale] = useState<number>(null)
  const [unbondingAmpWhale, setUnbondingAmpWhale] = useState<number>(null)
  const [unbondingBWhale, setUnbondingBWhale] = useState<number>(null)
  const [withdrawableAmpWhale, setWithdrawableAmpWhale] = useState<number>(null)
  const [withdrawableBWhale, setWithdrawableBWhale] = useState<number>(null)

  const onInputChange = ( tokenSymbol: string | null , amount: number) => {

    const newState: TokenItemState = {
      tokenSymbol: tokenSymbol ?? token.tokenSymbol,
      amount: Number(amount),
      decimals: 6,
    }
    setCurrentBondState(newState)
  }
  async function fetchLSDInfo() {

    // const {balance: liquidAmpWhale} = useTokenBalance(
    //  "ampWHALE")
    //const {balance: liquidBWhale} = useTokenBalance(
    //"bWHALE")
    setLiquidAmpWhale(liquidWhale)
    setLiquidBWhale(101)
    setBondedAmpWhale(345)
    setBondedBWhale(1345)
    setUnbondingAmpWhale(234)
    setUnbondingBWhale(4234)
    setWithdrawableAmpWhale(4637)
    setWithdrawableBWhale(8383)
  }
  useEffect(() => {
    if (currentBondingSummaryState.status === BondingSummaryStatus.uninitialized && isWalletConnected) {
      fetchLSDInfo().then(_=>{
        setCurrentBondingSummaryState({
          status: BondingSummaryStatus.available,
          edgeTokenList: ["WHALE", "bWHALE"],
          unbondingPeriod: unbondingPeriod,
          liquidAmpWhale:liquidAmpWhale,
          liquidBWhale:liquidBWhale,
          bondedAmpWhale: bondedAmpWhale,
          bondedBWhale: bondedBWhale,
          unbondingAmpWhale: unbondingAmpWhale,
          unbondingBWhale: unbondingBWhale,
          withdrawableAmpWhale: withdrawableAmpWhale,
          withdrawableBWhale: withdrawableBWhale,
        })
      })

    } else {

      setBondedAmpWhale(currentBondingSummaryState.bondedAmpWhale)
      setBondedBWhale(currentBondingSummaryState.bondedBWhale)
      setUnbondingAmpWhale(currentBondingSummaryState.unbondingAmpWhale)
      setUnbondingBWhale(currentBondingSummaryState.unbondingBWhale)
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
          balance={liquidWhale}
          minMax={false}
          // onInputFocus={() => setIsReverse(true)}
          disabled={false}
          onChange={(value, isTokenChange) => {
            onInputChange(value, 0)
            field.onChange(value)
            setCurrentBondState({...token, amount: value.amount})
          }}
        />
      )}
    />
  </VStack>
}

export default Bond
