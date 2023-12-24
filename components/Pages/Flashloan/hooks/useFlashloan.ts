import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import flashLoanContract from 'constants/vaultRouterAddresses.json'
import { useClients } from 'hooks/useClients'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { createFlashLoanMsg } from './createFlashLoanMsg'
import useTransaction from './useTransaction'

const useFlashloan = ({ json }) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const encodedMsgs = useMemo(() => {
    if (Object.keys(json).length === 0 || !chainId) {
      return null
    }

    return createFlashLoanMsg({
      senderAddress: address,
      contractAddress: flashLoanContract[chainId],
      message: json,
    })
  }, [json, address, chainId])

  return useTransaction({
    enabled: Boolean(signingClient) && Boolean(encodedMsgs),
    msgs: json,
    signingClient,
    injectiveSigningClient,
    senderAddress: address,
    encodedMsgs: [encodedMsgs],
    contractAddress: flashLoanContract[chainId],
  })
}

export default useFlashloan
