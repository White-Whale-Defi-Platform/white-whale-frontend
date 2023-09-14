import { useMemo } from 'react'
import { useQuery } from 'react-query'

import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

type FactoryConfig = {
  createFlowFee: {
    amount: string
    denom: string
  }
  minUnbondingDuration: any
  maxUnbondingDuration: any
}

const useFactoryConfig = (incentiveFactory: string) => {
  const { client } = useRecoilValue(chainState)

  const { data: config } = useQuery<FactoryConfig>({
    queryKey: ['factoryConfig', incentiveFactory],
    queryFn: () => client?.
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
    enabled: Boolean(incentiveFactory) && Boolean(client),
  })

  return useMemo(() => config, [config])
}

export default useFactoryConfig
