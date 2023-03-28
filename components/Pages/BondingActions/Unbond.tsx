import React, {useEffect, useState} from 'react'
import {VStack} from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {useRecoilState} from "recoil";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {Controller, useForm} from "react-hook-form";
import {AMP_WHALE_TOKEN_SYMBOL} from "../../../constants/bonding_contract";
import {LSDToken, LSDTokenBalances, LSDTokenItemState} from "./Bond";
import {bondingAtom} from "./bondAtoms";

const Unbond = ({bondedAmpWhale, bondedBWhale})  => {

  const [{status}, _] = useRecoilState(walletState)
  const [currentBondState, setCurrentBondState] = useRecoilState<LSDTokenItemState>(bondingAtom)

  const isWalletConnected = status === WalletStatusType.connected

  //const {bondingConfig} = useBondingConfig(client)
 // const unbondingPeriodInNano = Number(bondingConfig?.unbonding_period)*1_000_000_000 ?? 60*1_000_000_000

  //const {unbondingAmpWhale, unbondingBWhale} = useUnbonding(client, address)
  const [tokenBalances, setLSDTokenBalances] = useState<LSDTokenBalances>(null)

  useEffect(()=>{
    const newBalances : LSDTokenBalances = {
      ampWHALE: bondedAmpWhale,
      bWHALE: bondedBWhale,
    }
    setLSDTokenBalances(newBalances)
  },[bondedAmpWhale, bondedBWhale])

  const onInputChange = ( tokenSymbol: string | null , amount: number) => {

    if(tokenSymbol){
      setCurrentBondState({...currentBondState, tokenSymbol:tokenSymbol, amount:Number(amount)})}else{
      setCurrentBondState({...currentBondState,amount:Number(amount)})
    }
  }

  useEffect(() => {
    const newState: LSDTokenItemState = {
      tokenSymbol: AMP_WHALE_TOKEN_SYMBOL,
      amount: 0,
      decimals: 6,
      lsdToken: LSDToken.ampWHALE
    }
    setCurrentBondState(newState)
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
            hideToken={currentBondState.tokenSymbol}
            {...field}
            token={currentBondState}
            balance={ (() => {
              switch (currentBondState.lsdToken) {
                case LSDToken.ampWHALE:
                  return tokenBalances?.ampWHALE ?? 0;
                case LSDToken.bWHALE:
                  return tokenBalances?.bWHALE ?? 0;
                default:
                  return 0; // or any other default value
              }
            })()
            }
            minMax={false}
            disabled={false}
            onChange={(value, isTokenChange) => {
              onInputChange(value, 0)
              field.onChange(value)
              if(isTokenChange){
                let lsdToken = value.tokenSymbol === AMP_WHALE_TOKEN_SYMBOL ? LSDToken.ampWHALE : LSDToken.bWHALE
                setCurrentBondState({...currentBondState, tokenSymbol: value.tokenSymbol,amount: value.amount,lsdToken:lsdToken })}
              else{
                setCurrentBondState({...currentBondState, amount: value.amount})
              }
            }}
          />
        )}
      />
    </VStack>

}

export default Unbond
