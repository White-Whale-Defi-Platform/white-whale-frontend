import React from 'react'

import { IconButton } from '@chakra-ui/react'
import LogoutIcon from 'components/Icons/LogoutIcon'
import { ConnectedWallet } from 'components/Wallet/ConnectedWalletWithDisconnect/ConnectedWallet/ConnectedWallet'

export const ConnectedWalletWithDisconnect = ({ onDisconnect }) => (
  <>
    <ConnectedWallet />
    <IconButton
      aria-label="Logout"
      icon={<LogoutIcon />}
      variant="unstyled"
      size="xs"
      _focus={{
        boxShadow: 'none',
      }}
      _hover={{
        color: 'brand.500',
      }}
      onClick={onDisconnect}
    />
  </>
)

