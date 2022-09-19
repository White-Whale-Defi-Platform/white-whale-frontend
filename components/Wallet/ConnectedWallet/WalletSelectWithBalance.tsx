import React from 'react'
import DisplayBalance from 'components/Wallet/ConnectedWallet/DisplayBalance'
import Select from '../Select'
import { HStack } from '@chakra-ui/react'
import { useChains } from '../../../hooks/useChainInfo'
import { useRecoilState } from 'recoil'
import { walletState } from '../../../state/atoms/walletAtoms'
function WalletSelectWithBalance({connected, denom, onChainChange}) {
  const chains = useChains()
  const [currentWalletState, setCurrentWalletState] = useRecoilState(walletState)
  return (
    <HStack spacing="4"  >
      <DisplayBalance />
    
      <Select
        connected={connected}
        denom={denom?.coinDenom}
        chainList={chains}
        onChange={onChainChange}/>
    </HStack>
  )
}

export default WalletSelectWithBalance