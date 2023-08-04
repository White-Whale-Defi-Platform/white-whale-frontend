import { useMemo } from 'react'

import flashLoanContract from 'constants/vaultRouterAddresses.json'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'

import { createFlashLoanMsg } from './createFlashLoanMsg'
import useTransaction from './useTransaction'
import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'

const useFlashloan = ({ json }) => {
  const { chainName, chainId } = useRecoilValue(chainState)
  const { address } = useChain(chainName)
  const { signingClient: client } = useClients(chainName)
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
    enabled: !!client && !!encodedMsgs,
    msgs: json,
    client,
    senderAddress: address,
    encodedMsgs: [encodedMsgs],
    contractAddress: flashLoanContract[chainId],
  })
}

export default useFlashloan
