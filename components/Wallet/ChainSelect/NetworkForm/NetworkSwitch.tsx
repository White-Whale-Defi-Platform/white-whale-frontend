import React from 'react'
import { useQueryClient } from 'react-query'

import { Switch } from '@chakra-ui/react'
import { useWallet } from '@terra-money/wallet-provider'
import { useRecoilState } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

function NetworkSwitch() {
  const queryClient = useQueryClient()
  const [currentWalletState, setWalletState] = useRecoilState(walletState)
  const { disconnect } = useWallet()

  const changeNetwork = ({ target }) => {
    queryClient.invalidateQueries([
      'multipleTokenBalances',
      'tokenBalance',
      '@pools-list',
    ])
    console.log('network change triggered' + target.checked)
    const updatedChainId =
      currentWalletState.chainId === 'migaloo-1' && target.checked
        ? 'narwhal-1'
        : currentWalletState.chainId === 'narwhal-1' && !target.checked
        ? 'migaloo-1'
        : currentWalletState.chainId
    setWalletState({
      ...currentWalletState,
      network: target.checked ? 'testnet' : 'mainnet',
      chainId: updatedChainId,
    })
    disconnect()
  }

  return (
    <>
      <Switch
        id="network"
        isChecked={currentWalletState.network === 'testnet'}
        onChange={changeNetwork}
      />
    </>
  )
}

export default NetworkSwitch
