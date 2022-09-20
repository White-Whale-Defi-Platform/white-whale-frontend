import React from 'react'
import { Box, Img } from '@chakra-ui/react'
import { useConnectedWallet } from '@terra-money/wallet-provider'

import KeplrWalletIcon from 'components/icons/KeplrWalletIcon'

function ConnectedWalletIcon({connected}) {
  const connectedWallet = useConnectedWallet()
  return (
    <>
    {connected ?
      (<Box>
       <KeplrWalletIcon />
        </Box>) :
      (<Box  width="100">
        <Img  width="6"  src={connectedWallet.connection.icon} />
      </Box>)
    }
    </>
              
  )
}

export default ConnectedWalletIcon