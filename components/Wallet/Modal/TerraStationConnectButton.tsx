import React from 'react'
import { Button } from '@chakra-ui/react'
import { useWallet } from "@terra-money/wallet-provider";

import { useTerraStation } from 'hooks/useTerraStation';

function TerraStationConnectButton({onCloseModal}) {
  const {
    availableConnections,
    availableInstallations,
  } = useWallet();
  const {connectTerraAndCloseModal, filterForStation} = useTerraStation(onCloseModal)


  return (
          <>
            {availableConnections.filter(filterForStation)
              .map(({ type, identifier, name, icon }) => (

                <Button colorScheme='black' key={identifier} onClick={() => connectTerraAndCloseModal(type, identifier)}>
                  <img
                    src={icon}
                    alt={name}
                    style={{ width: "1em", height: "1em" }}
                  />
                Connect {name} [{identifier}]
                </Button>
            ))}
            {availableInstallations.filter(filterForStation)
              .map(({ identifier, name, icon, url }) => (
                <Button colorScheme="black" key={identifier} onClick={() => (window.location.href = url)}>
                  <img
                  src={icon}
                  alt={name}
                  style={{ width: "1em", height: "1em" }}
                />
                Install {name} [{identifier}]
                </Button>
            ))}
            </>
  )
}

export default TerraStationConnectButton