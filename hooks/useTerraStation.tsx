import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { Connection, ConnectType, useConnectedWallet, useWallet } from "@terra-money/wallet-provider"
import { LCDClient } from "@terra-money/terra.js"

import { TerraStationWallet } from "util/wallet-adapters/terraStationWallet"
import { walletState, WalletStatusType } from "state/atoms/walletAtoms"



export const useTerraStation = (onCloseModal) => {
  const {connect} = useWallet()
  const connectedWallet = useConnectedWallet()
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)

  const filterForStation = (connection: Connection) => {
    return connection.identifier === 'station'
  }

  const connectTerraAndCloseModal = (type: ConnectType, identifier: string) => {
    setCurrentWalletState({...currentWalletState, activeWallet: 'station'})
    connect(type , identifier)
    onCloseModal()
  }

  useEffect(() => {
    if(!connectedWallet){
      return console.log('no connected wallet found')
    }
    const testnet = new LCDClient({
      URL: "https://pisco-lcd.terra.dev",
      chainID: "pisco-1",
    })
    const mainnet = new LCDClient({
      URL: "https://phoenix-lcd.terra.dev",
      chainID: "phoenix-1"
    })
    const wasmChainClient = new TerraStationWallet(
      connectedWallet,
      currentWalletState.network === 'mainnet' ? mainnet : testnet,
      currentWalletState.network === 'mainnet' ? 'mainnet' : 'testnet'
    )
    setCurrentWalletState({
      key:null,
      status: WalletStatusType.connected,
      address: wasmChainClient.client?.terraAddress,
      chainId: currentWalletState.chainId,
      network: currentWalletState.network,
      client: wasmChainClient,
      activeWallet:'station'
    }) 
  }, [connectedWallet, currentWalletState.network,])

  return {connectTerraAndCloseModal, filterForStation}
}