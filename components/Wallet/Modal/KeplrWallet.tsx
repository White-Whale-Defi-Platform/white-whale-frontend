import { Button } from '@chakra-ui/react'
import React from 'react'
import { useRecoilValue } from 'recoil'

import useWalletConnect from '../../../hooks/useWalletConnect'
import { walletState } from '../../../state/atoms/walletAtoms'
import KeplrWalletIcon from '../../icons/KeplrWalletIcon'


function KeplrWallet() {
  const {setKeplr} = useWalletConnect()
  const {chainId} = useRecoilValue(walletState)

  return (
    <Button onClick={() => setKeplr(chainId)} colorScheme="black"><KeplrWalletIcon/> Connect Keplr Wallet</Button>
  )
}


export default KeplrWallet
