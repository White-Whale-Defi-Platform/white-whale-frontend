import React from 'react'
import ConnectedWallet from './ConnectedWallet'
import { IconButton } from '@chakra-ui/react'
import LogoutIcon from '../../icons/LogoutIcon'
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