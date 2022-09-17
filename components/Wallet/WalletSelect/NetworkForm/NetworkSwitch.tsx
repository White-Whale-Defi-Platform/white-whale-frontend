import React from 'react'
import { Switch } from '@chakra-ui/react'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import {  walletState } from 'state/atoms/walletAtoms'
import { useChainInfo, useChains } from '../../../../hooks/useChainInfo'
import { useWallet } from '@terra-money/wallet-provider'

function NetworkSwitch({onDisconnect}) {
  const queryClient = useQueryClient()
  const [currentWalletState, setWalletState] = useRecoilState(walletState)
  const {disconnect} = useWallet()

  const setNetwork = (network: 'testnet' | 'mainnet') => {
    setWalletState({...currentWalletState,
      network: network});
      // window.location.reload()
  }

  return (
    <>
    <Switch
      id='network'
      isChecked={currentWalletState.network === 'testnet'}
      onChange={({ target }) => {
        queryClient.invalidateQueries(['multipleTokenBalances', 'tokenBalance', '@pools-list'])
        setWalletState({...currentWalletState, network: (target.checked ? 'testnet' : 'mainnet' )})
        disconnect()
      }} />
    </>
  )
}

export default NetworkSwitch