import { Button } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useRecoilValue } from 'recoil'

import useWalletConnect from '../../../hooks/useWalletConnect'
import { walletState } from '../../../state/atoms/walletAtoms'
import KeplrWalletIcon from '../../icons/KeplrWalletIcon'


function KeplrWallet({onCloseModal}) {
  const {setKeplr} = useWalletConnect({onCloseModal})
  const {chainId, activeWallet} = useRecoilValue(walletState)

  const setKeplrMemo = useCallback((chainId) => {
    setKeplr()
    onCloseModal()
  }, [activeWallet])

  return (
    <Button onClick={() => setKeplrMemo(chainId)} colorScheme="black"><KeplrWalletIcon/> Connect Keplr Wallet</Button>
  )
}


export default KeplrWallet
