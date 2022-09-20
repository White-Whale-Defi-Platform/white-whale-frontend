import { Button } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useRecoilValue } from 'recoil'

import useConnectKeplr from 'hooks/useConnectKeplr'
import { walletState } from 'state/atoms/walletAtoms'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'

function KeplrConnectButton({onCloseModal}) {
  const {setKeplrAndConnect} = useConnectKeplr()
  const {chainId, activeWallet, network,} = useRecoilValue(walletState)

  const setKeplrMemo = useCallback(() => {
    setKeplrAndConnect()
    onCloseModal()
  }, [activeWallet, chainId, network])

  return (
    <Button onClick={() => setKeplrMemo()} colorScheme="black"><KeplrWalletIcon/> Connect Keplr Wallet</Button>
  )
}


export default KeplrConnectButton
