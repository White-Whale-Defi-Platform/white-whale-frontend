import React from 'react'
import { IconButton } from '@chakra-ui/react'

import ConnectedWallet from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWallet/ConnectedWallet'
import LogoutIcon from 'components/icons/LogoutIcon'

function ConnectedWalletWithDisconnect({connected, onDisconnect}) {
  return (
    <>
      <ConnectedWallet connected={connected} />
      <IconButton
        aria-label="Logout"
        icon={<LogoutIcon />}
        variant="unstyled"
        size="xs"
        _focus={{
          boxShadow: "none",
        }}
        _hover={{
          color: "brand.500",
        }}
        onClick={ onDisconnect }
      />
    </>

  )
}

export default ConnectedWalletWithDisconnect