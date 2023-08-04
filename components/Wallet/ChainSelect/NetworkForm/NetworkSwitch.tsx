import React from 'react'
import { useQueryClient } from 'react-query'

import { Switch } from '@chakra-ui/react'
import { useWallet } from '@terra-money/wallet-provider'
import { MAINNET_TESTNET_MAP, NETWORK_MAP } from 'constants/index'
import { useRecoilState } from 'recoil'
import { NetworkType, walletState } from 'state/atoms/walletAtoms'

function NetworkSwitch() {
  const queryClient = useQueryClient()
  const [currentWalletState, setWalletState] = useRecoilState(walletState)
  const { disconnect } = useWallet()

  const changeNetwork = async () => {
    await queryClient.clear()

    const updatedChainId =
      MAINNET_TESTNET_MAP?.[currentWalletState.chainId] ??
      currentWalletState.chainId
    const updatedNetwork =
      updatedChainId !== currentWalletState.chainId
        ? NETWORK_MAP[currentWalletState.network]
        : currentWalletState.network

    setWalletState({
      ...currentWalletState,
      network: NetworkType[updatedNetwork],
      chainId: updatedChainId,
    })
    disconnect()
  }

  return (
    <>
      <Switch
        id="network"
        isChecked={currentWalletState.network === NetworkType.testnet}
        onChange={changeNetwork}
      />
    </>
  )
}

export default NetworkSwitch
