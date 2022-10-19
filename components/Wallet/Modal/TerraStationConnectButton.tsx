import React from 'react'

import { Button, HStack, Image, Text } from '@chakra-ui/react'
import { useWallet } from '@terra-money/wallet-provider'
import { useTerraStation } from 'hooks/useTerraStation'

function TerraStationConnectButton({ onCloseModal }) {
  const { availableConnections, availableInstallations } = useWallet()
  const { connectTerraAndCloseModal, filterForStation } =
    useTerraStation(onCloseModal)

  return (
    <>
      {availableConnections
        .filter(filterForStation)
        .map(({ type, identifier, name, icon }) => (
          <Button
            variant="wallet"
            key={identifier}
            onClick={() => connectTerraAndCloseModal(type, identifier)}
          >
            <HStack justify="space-between" width="full">
              <Text>{name}</Text>
              <Image boxSize="24px" objectFit="cover" src={icon} alt={name} />
            </HStack>
          </Button>
        ))}
      {availableInstallations
        .filter(filterForStation)
        .map(({ identifier, name, icon, url }) => (
          <Button
            colorScheme="black"
            key={identifier}
            onClick={() => (window.location.href = url)}
          >
            <img
              src={icon}
              alt={name}
              style={{ width: '1em', height: '1em' }}
            />
            Install {name} [{identifier}]
          </Button>
        ))}
    </>
  )
}

export default TerraStationConnectButton
