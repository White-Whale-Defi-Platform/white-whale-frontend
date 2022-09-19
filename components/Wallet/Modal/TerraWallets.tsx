import {
  Button
} from '@chakra-ui/react'
import { useWallet } from "@terra-money/wallet-provider";
import React, { useCallback } from 'react'
import { useRecoilValue } from 'recoil';

import useWalletConnect from '../../../hooks/useWalletConnect';
import { activeWalletAtom } from '../../../state/atoms/activeWalletAtom';

function TerraWallets({onCloseModal}) {
  const {
    availableConnections,
    availableInstallations,
    connection
  } = useWallet();
  const {setTerraActiveAndConnect} = useWalletConnect(onCloseModal)

  const getTerraStation = (connection) => {
    return connection.identifier === 'station'
  }

  return (
          <>
            {availableConnections.filter(getTerraStation)
              .map(({ type, identifier, name, icon }) => (
                
                <Button colorScheme='black' key={identifier} onClick={() => setTerraActiveAndConnect(type, identifier)}>
                  <img
                    src={icon}
                    alt={name}
                    style={{ width: "1em", height: "1em" }}
                  />
                Connect {name} [{identifier}]
                </Button>
            ))}
            {availableInstallations.filter(getTerraStation)
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

export default TerraWallets
