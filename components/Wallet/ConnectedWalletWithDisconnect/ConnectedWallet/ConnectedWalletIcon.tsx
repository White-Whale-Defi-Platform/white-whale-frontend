import React from 'react'

import { Box, Img } from '@chakra-ui/react'
import { useConnectedWallet } from '@terra-money/wallet-provider'
import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

function ConnectedWalletIcon({ connected }) {
  const connectedWallet = useConnectedWallet()
  const { activeWallet } = useRecoilValue(walletState)
  return (
    <>
      {connected ? (
        <Box>
          {activeWallet === 'leap' ? (
            <img
              src="https://assets.leapwallet.io/leap/cosmos.svg"
              alt=""
              width="24"
              height="24"
            />
          ) : (
            <KeplrWalletIcon />
          )}
        </Box>
      ) : (
        <Box width="100">
          <Img width="6" src={connectedWallet.connection.icon} />
        </Box>
      )}
    </>
  )
}

export default ConnectedWalletIcon
