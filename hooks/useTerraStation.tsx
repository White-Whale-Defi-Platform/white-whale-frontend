import { useEffect } from 'react'

import { LCDClient } from '@terra-money/feather.js'
import {
  Connection,
  ConnectType,
  useConnectedWallet,
  useWallet,
} from '@terra-money/wallet-provider'

import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { TerraStationWallet } from 'util/wallet-adapters/terraStationWallet'
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
    // TODO: Make this better and derived from like a config or something
    // Previous pattern we did was passing 1 chain config when on a given chain but here we can pass em all at once
    let mainnet = new LCDClient({ 
      'juno-1':{
        lcd: 'https://rest.cosmos.directory/juno',
        chainID: 'juno-1',
        gasAdjustment: 1.75,
        gasPrices: { ujuno: 0.015 },
        prefix: 'juno',
      },
      'phoenix-1':{
        lcd: 'https://rest.cosmos.directory/terra2',
        chainID: 'phoenix-1',
        gasAdjustment: 1.75,
        gasPrices: { uluna: 0.015 },
        prefix: 'luna',
      },
      'chihuahua-1':{
        lcd: 'https://rest.cosmos.directory/chihuahua',
        chainID: 'chihuahua-1',
        gasAdjustment: 1.75,
        gasPrices: { uhuahua: 0.015 },
        prefix: 'chihuahua',
      },
      'comdex-1':{
        lcd: 'https://ww-comdex-rest.polkachu.com/comdex',
        chainID: 'comdex-1',
        gasAdjustment: 1.75,
        gasPrices: { ucmdx: 0.015 },
        prefix: 'comdex',
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
      currentWalletState.network === 'mainnet' ? 'mainnet' : 'testnet',
      currentWalletState.chainId
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet, currentWalletState.network])

  return { connectTerraAndCloseModal, filterForStation }
}
