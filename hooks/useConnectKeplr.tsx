import { GasPrice } from '@cosmjs/stargate';
import { useConnectedWallet, useWallet } from "@terra-money/wallet-provider"
import { useCallback } from 'react';
import { useRecoilState } from "recoil"

import {  walletState, WalletStatusType } from "../state/atoms/walletAtoms"
import { OfflineSigningWallet } from '../util/wallet-adapters';
import { useChainInfo } from "./useChainInfo"

export default function useConnectKeplr() {
  const [{chainId, network}, setWalletState] = useRecoilState(walletState)
  let [chainInfo] = useChainInfo(chainId)
  const connectedWallet = useConnectedWallet()
  const {disconnect} = useWallet()

  const connectKeplr = async () => {
    if(connectedWallet){
      disconnect()
    }
     if (window && !window?.keplr) {
      alert('Please install Keplr extension and refresh the page.')
      return
    }

    try {
      if(chainInfo !== undefined){
        await window.keplr?.experimentalSuggestChain(chainInfo)
        await window.keplr.enable(chainId)
        const offlineSigner = await window.getOfflineSignerAuto(chainId)
        const wasmChainClient = await OfflineSigningWallet.connectWithSigner(
          chainInfo.rpc,
          offlineSigner,
          network,
          {
            gasPrice: GasPrice.fromString(`${chainInfo?.gasPriceStep?.low}${chainInfo?.feeCurrencies?.[0].coinMinimalDenom}`)
          }
      )
        const [{ address }] = await offlineSigner.getAccounts()
        const key = await window.keplr.getKey(chainId)
        /* successfully update the wallet state */
      setWalletState({
        key,
        address: address,
        client: wasmChainClient,
        chainId: chainId,
        network: network,
        status: WalletStatusType.connected,
        activeWallet:'keplr'
      })
      }
    } catch (e) {
      throw e
    }
  }

  const connectKeplrMemo = useCallback(() => {
    connectKeplr(chainId)
  }, [chainId, network])

  return {connectKeplr, connectKeplrMemo}
}
