import { useQuery } from 'react-query'

import { cosmWasmClientRouter } from '../util/cosmWasmClientRouter'
import { useChainInfo } from './useChainInfo'

export const useCosmWasmClient = (chainId) => {
  const [chainInfo] = useChainInfo(chainId)

  const { data } = useQuery(
    '@cosmwasm-client',
    () => cosmWasmClientRouter.connect(chainInfo.rpc),
    { enabled: Boolean(chainInfo?.rpc) }
  )

  return data
}
