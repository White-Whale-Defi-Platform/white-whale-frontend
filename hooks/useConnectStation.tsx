import { LCDClient } from '@terra-money/terra.js';
import { useConnectedWallet } from "@terra-money/wallet-provider"
import { useRecoilValue,useSetRecoilState } from "recoil"

import { walletState } from "../state/atoms/walletAtoms"
import { WalletStatusType } from "../state/atoms/walletAtoms"
import { TerraStationWallet } from "../util/wallet-adapters/terraStationWallet"

export default function useConnectStation() {
  const setWalletState = useSetRecoilState(walletState)
  const connectedWallet = useConnectedWallet()
   const { network, activeWallet } = useRecoilValue(walletState)

  const connectStation = (chainId: string) => {
    if (window && !window?.terraWallets){
      alert('Please install Terra Station extension and refresh the page.')
      return
    }
    const testnet = new LCDClient({
      URL: "https://pisco-lcd.terra.dev",
      chainID: "pisco-1",
    })
    const mainnet = new LCDClient({
      URL: "https://phoenix-lcd.terra.dev",
      chainID: "phoenix-1"
    })
    if(connectedWallet){
    const wasmChainClient = new TerraStationWallet(
      connectedWallet,
      // This should be driven from the chainInfo, however the REST endpoint defined has CORS restrictions
      network === 'mainnet' ? mainnet : testnet,
      network
      /*
      new LCDClient({
        URL: chainInfo.rest,
        chainID: chainInfo.chainId
      })
      */
    )
    setWalletState({
      key:null,
      status: WalletStatusType.connected,
      address: wasmChainClient.client?.terraAddress,
      chainId: chainId,
      network: network,
      client: wasmChainClient,
      activeWallet: 'station'
    })
    }
    
  }

  return {connectStation}
}
