import React from 'react'
import { Switch } from '@chakra-ui/react'
import { useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { useWallet } from '@terra-money/wallet-provider'

function NetworkSwitch() {
  const queryClient = useQueryClient()
  const [currentWalletState, setWalletState] = useRecoilState(walletState)
  const {disconnect} = useWallet()

  const changeNetwork = (({target}) => {
    queryClient.invalidateQueries(['multipleTokenBalances', 'tokenBalance', '@pools-list'])
    setWalletState({...currentWalletState, network: (target.checked ? 'testnet' : 'mainnet' )})
    disconnect()
  })

  return (
    <>
    <Switch
      id='network'
      isChecked={currentWalletState.network === 'testnet'}
      onChange={changeNetwork} />
    </>
  )
}

export default NetworkSwitch