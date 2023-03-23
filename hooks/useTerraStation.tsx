import { useEffect, useMemo } from 'react'

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
  const filterForWalletConnect = (connection: Connection) => {
    return connection.type === 'WALLETCONNECT'
  }

  const connectTerraAndCloseModal = (type: ConnectType, identifier: string) => {
    const activeWallet = type === 'WALLETCONNECT' ? 'walletconnect' : 'station'
    setCurrentWalletState({ ...currentWalletState, activeWallet })
    connect(type, identifier)
    onCloseModal()
  }

  const { mainnet, testnet } = useMemo(() => {

    const testnet = new LCDClient({
      'pisco-1': {
        lcd: 'https://pisco-lcd.terra.dev',
        chainID: 'pisco-1',
        gasAdjustment: 1.75,
        gasPrices: { uluna: 0.015 },
        prefix: 'terra',
      }
    })
    // TODO: Make this better and derived from like a config or something
    // Previous pattern we did was passing 1 chain config when on a given chain but here we can pass em all at once
    const mainnet = new LCDClient({
      'juno-1':{
        lcd: 'https://ww-juno-rest.polkachu.com',
        chainID: 'juno-1',
        gasAdjustment: 0.004,
        gasPrices: { ujuno: 0.0025 },
        prefix: 'juno',
      },
      'phoenix-1':{
        lcd: 'https://ww-terra-rest.polkachu.com',
        chainID: 'phoenix-1',
        gasAdjustment: 1.75,
        gasPrices: { uluna: 0.015 },
        prefix: 'terra',
      },
      'chihuahua-1':{
        lcd: 'https://ww-chihuahua-rest.polkachu.com',
        chainID: 'chihuahua-1',
        gasAdjustment: 5,
        gasPrices: { uhuahua: 1 },
        prefix: 'chihuahua',
      },
      'migaloo-1': {
        lcd: 'https://ww-migaloo-rest.polkachu.com/',
        chainID: 'migaloo-1',
        gasAdjustment: 0.1,
        gasPrices: { uwhale: 0.05 },
        prefix: 'migaloo',
      }
    })

    return { mainnet, testnet }

  }, [])

  const wasmChainClient = useMemo(() => {
    return new TerraStationWallet(
      connectedWallet,
      currentWalletState.network === 'mainnet' ? mainnet : testnet,
      currentWalletState.network === 'mainnet' ? 'mainnet' : 'testnet',
      currentWalletState.chainId
    )
  }, [connectedWallet, currentWalletState.network, mainnet, testnet, currentWalletState.chainId])

  useEffect(() => {
    if (currentWalletState?.activeWallet !== 'station') {
      return
    }

    setCurrentWalletState({
      key: null,
      status: connectedWallet? WalletStatusType.connected : WalletStatusType.disconnected,
      address: connectedWallet?.addresses[currentWalletState.chainId],
      chainId: currentWalletState.chainId,
      network: currentWalletState.network,
      client: wasmChainClient,
      activeWallet: connectedWallet?.connectType === 'WALLETCONNECT' ? 'walletconnect' : 'station'
    })



    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet, currentWalletState.network, mainnet, testnet, wasmChainClient, currentWalletState.chainId])

  return { connectTerraAndCloseModal, filterForStation, filterForWalletConnect }
}
