import { useMemo } from 'react'

import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'

import { createFlashLoanMsg } from './createFlashLoanMsg'
import flashLoanContract from './flashLoanContract.json'
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

  const tx = useTransaction({
    // enabled : !!client && !!encodedMsgs,
    enabled: false,
    msgs: json,
    client,
    senderAddress: address,
    encodedMsgs: [encodedMsgs],
    contractAddress: flashLoanContract[chainId],
  })

  return tx
}

export default useFlashloan
