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

  const changeNetwork = async ({ target }) => {
    const checked = target.checked
    await queryClient.invalidateQueries([
      'multipleTokenBalances',
      'tokenBalance',
      '@pools-list',
    ])
    console.log('network change triggered' + checked)
    const updatedChainId =
      currentWalletState.chainId === 'migaloo-1' && checked
        ? 'narwhal-1'
        : currentWalletState.chainId === 'narwhal-1' && !checked
        ? 'migaloo-1'
        : currentWalletState.chainId
    setWalletState({
      ...currentWalletState,
      network: checked ? 'testnet' : 'mainnet',
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
