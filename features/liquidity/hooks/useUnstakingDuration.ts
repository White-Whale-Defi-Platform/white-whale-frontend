import { useChainInfo } from 'hooks/useChainInfo'
import { useQuery } from 'react-query'
import {useRecoilValue} from "recoil";
import { getUnstakingDuration } from 'services/staking'
import {walletState, WalletStatusType} from 'state/atoms/walletAtoms'

import {
  PoolEntityType,
  usePoolFromListQueryById,
} from '../../../queries/usePoolsListQuery'

type UseUnstakingDurationArgs = {
  poolId: PoolEntityType['pool_id']
}

export const useUnstakingDuration = ({ poolId }: UseUnstakingDurationArgs) => {
  const [pool] = usePoolFromListQueryById({ poolId })
  const [chainInfo] = useChainInfo()
  const { client } = useRecoilValue(walletState)

  const { data = 0, isLoading } = useQuery(
    `unstakingDuration/${poolId}`,
    async () => {
      return getUnstakingDuration(pool?.staking_address, client)
    },
    {
      enabled: Boolean(
        pool?.staking_address && status === WalletStatusType.connected
      ),
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  )

  return [data, isLoading] as const
}
