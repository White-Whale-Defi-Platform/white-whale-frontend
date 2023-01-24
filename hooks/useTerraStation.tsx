import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import {
  Connection,
  ConnectType,
  useConnectedWallet,
  useWallet,
} from '@terra-money/wallet-provider'
import { LCDClient } from '@terra-money/feather.js'

import { TerraStationWallet } from 'util/wallet-adapters/terraStationWallet'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { useChainInfo } from './useChainInfo'

export const useTerraStation = (onCloseModal) => {
  const { connect } = useWallet()
  const connectedWallet = useConnectedWallet()
  const [currentWalletState, setCurrentWalletState] =
    useRecoilState(walletState)
  let [chainInfo] = useChainInfo(currentWalletState.chainId)

  const filterForStation = (connection: Connection) => {
    return connection.identifier === 'station'
  }

  const connectTerraAndCloseModal = (type: ConnectType, identifier: string) => {
    setCurrentWalletState({ ...currentWalletState, activeWallet: 'station' })
    connect(type, identifier)
    onCloseModal()
  }

  useEffect(() => {
    if (!connectedWallet) {
      return console.log('no connected wallet found')
    }

    let testnet = new LCDClient({
      'pisco-1':{
        lcd: 'https://pisco-lcd.terra.dev',
        chainID: 'pisco-1',
        gasAdjustment: 1.75,
        gasPrices: { uluna: 0.015 },
        prefix: 'terra',
      }
      
    })
    let mainnet = new LCDClient({
      
      'juno-1':{
        lcd: 'https://ww-juno-rest.polkachu.com',
        chainID: 'juno-1',
        gasAdjustment: 1.75,
        gasPrices: { ujuno: 0.015 },
        prefix: 'juno',
      }
    })

    // // If we have chainInfo, overwrite with that info
    // if (chainInfo!== undefined){
    //     console.log(chainInfo)
        
    //     testnet = new LCDClient({
    //       'uni-5':{
    //         lcd: chainInfo.rpc,
    //         chainID: chainInfo.chainID,
    //         gasAdjustment: 1.75,
    //         gasPrices: { ujuno: 0.015 },
    //         prefix: 'juno',
    //       }
          
    //     })
    //     mainnet = new LCDClient({
    //       'juno-1':{
    //         lcd: chainInfo.rest,
    //         chainID: chainInfo.chainID,
    //         gasAdjustment: 1.75,
    //         gasPrices: { ujuno: 0.015 },
    //         prefix: 'juno',
    //       },'phoenix-1':{
    //         lcd: 'https://phoenix-lcd.terra.dev',
    //         chainID: 'phoenix-1',
    //         gasAdjustment: 1.75,
    //         gasPrices: { uluna: 0.015 },
    //         prefix: 'terra',
    //       }
    //     })
    // }
    console.log(mainnet);
    console.log(connectedWallet)
    const wasmChainClient = new TerraStationWallet(
      connectedWallet,
      currentWalletState.network === 'mainnet' ? mainnet : testnet,
      currentWalletState.network === 'mainnet' ? 'mainnet' : 'testnet'
    )
    console.log(wasmChainClient.client)
    setCurrentWalletState({
      key: null,
      status: WalletStatusType.connected,
      address: connectedWallet.addresses[currentWalletState.chainId],
      chainId: currentWalletState.chainId,
      network: currentWalletState.network,
      client: wasmChainClient,
      activeWallet: 'station',
    })
  }, [connectedWallet, currentWalletState.network])

  return { connectTerraAndCloseModal, filterForStation }
}
