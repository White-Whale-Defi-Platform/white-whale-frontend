import { useMemo } from 'react'

import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import { createFlashLoanMsg } from './createFlashLoanMsg'
import flashLoanContract from 'components/Pages/Flashloan/hooks/vaultRouterAddresses.json'
import useTransaction from './useTransaction'

const useFlashloan = ({ json }) => {
  const { address, client, chainId } = useRecoilValue(walletState)

  const encodedMsgs = useMemo(() => {
    if (Object.keys(json).length === 0 || !chainId) return null

    return createFlashLoanMsg({
      senderAddress: address,
      contractAddress: flashLoanContract[chainId],
      message: json,
    })
  }, [json, address, chainId])

  return useTransaction({
    enabled : !!client && !!encodedMsgs,
    msgs: json,
    client,
    senderAddress: address,
    encodedMsgs: [encodedMsgs],
    contractAddress: flashLoanContract[chainId],
  })
}

export default useFlashloan
