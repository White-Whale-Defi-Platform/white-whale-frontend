import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

import { useClients } from '../../../../../hooks/useClients'

type FactoryConfig = {
  createFlowFee: {
    amount: string
    denom: string
  }
  minUnbondingDuration: any
  maxUnbondingDuration: any
}

const useFactoryConfig = (incentiveFactory: string) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(walletChainName)
  // TODO: API
  const { data: config } = useQuery<FactoryConfig>({
    queryKey: ['factoryConfig', incentiveFactory],
    queryFn: () => cosmWasmClient?.
      queryContractSmart(incentiveFactory, {
        config: {},
      }).
      then((data) => ({
        createFlowFee: {
          amount: data?.create_flow_fee?.amount,
          denom: data?.create_flow_fee?.info?.native_token?.denom,
        },
        minUnbondingDuration: data?.min_unbonding_duration,
        maxUnbondingDuration: data?.max_unbonding_duration,
      })),
    enabled: Boolean(incentiveFactory) && Boolean(cosmWasmClient),
  })

  return useMemo(() => config, [config])
}

export default useFactoryConfig
