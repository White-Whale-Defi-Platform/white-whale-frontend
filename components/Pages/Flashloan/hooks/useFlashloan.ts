import { useMemo } from 'react'

import flashLoanContract from 'constants/vaultRouterAddresses.json'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { createFlashLoanMsg } from './createFlashLoanMsg'
import useTransaction from './useTransaction'
import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'


const useFlashloan = ({ json }) => {
  const { chainId, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
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
    senderAddress: address,
    encodedMsgs: [encodedMsgs],
    contractAddress: flashLoanContract[chainId],
  })
}

export default useFlashloan
