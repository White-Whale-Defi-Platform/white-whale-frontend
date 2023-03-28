import React, {useEffect, useState} from 'react'
import { VStack} from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import {useRecoilState} from "recoil";
import {bondingAtom} from "./bondAtoms";
import {Controller, useForm} from "react-hook-form";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";
import {AMP_WHALE_TOKEN_SYMBOL} from "../../../constants/bonding_contract";

export interface LSDTokenBalances {
  ampWHALE: number,
  bWHALE: number
}
export interface LSDTokenItemState {
  tokenSymbol: string
  amount: number
  decimals: number
  lsdToken : LSDToken
}
export enum LSDToken { ampWHALE,bWHALE}
const Bond = ({liquidAmpWhale, liquidBWhale}) => {

  const [currentBondState, setCurrentBondState] = useRecoilState<LSDTokenItemState>(bondingAtom)
  const [{status}, _] = useRecoilState(walletState)

  const isWalletConnected = status === WalletStatusType.connected

  const [tokenBalances, setLSDTokenBalances] = useState<LSDTokenBalances>(null)

  useEffect(()=>{
    const newBalances : LSDTokenBalances = {
    ampWHALE: liquidAmpWhale,
    bWHALE: liquidBWhale,
  }
    setLSDTokenBalances(newBalances)
  },[liquidAmpWhale, liquidBWhale])

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

export default Bond
