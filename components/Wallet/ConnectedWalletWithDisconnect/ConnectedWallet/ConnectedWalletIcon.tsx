import React from 'react'

import { useConnect } from '@quirks/react'
import Image from 'next/image'

export const ConnectedWalletIcon = () => {
  const { wallet } = useConnect()

  if (!wallet) {
    return null;
  }

  return <Image width={24} height={24} src={wallet.logoDark ?? wallet.logoLight} alt={wallet.options.pretty_name} />
}

