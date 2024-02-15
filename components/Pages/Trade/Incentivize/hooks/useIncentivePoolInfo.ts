import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import { useCurrentEpoch } from 'components/Pages/Trade/Incentivize/hooks/useCurrentEpoch'
import {
  ChainId,
} from 'constants/index'
import { usePrices } from 'hooks/usePrices'
import { useRecoilValue } from 'recoil'
import {
  PoolData,
  getPairAprAndDailyVolumeByEnigma,
  getPairAprAndDailyVolumeByCoinhall,
} from 'services/poolDataProvider'
import { getFlowsFromAPI } from 'services/useAPI'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom } from 'util/conversion/index'

import { getPoolInfo } from '../../Pools/hooks/queryPoolInfo'

export interface Flow {
  claimed_amount: string
  curve: string
  emitted_tokens: {
    [key: number]: string
  }
  end_epoch: number
  flow_asset: {
    amount: string
    info: {
      token?: {
        contract_addr: string
      }
      native_token?: {
        denom: string
      }
    }
  }
  flow_creator: string
  flow_id: number
  start_epoch: number
}
export interface FlowData {
  dailyEmission: number
  denom: string
  apr: number
  logoURI: string
  tokenSymbol: string
  endEpoch: number
}
export interface IncentivePoolInfo {
  flowData?: FlowData[]

  poolId: string
}
export const fetchTotalPoolSupply = async (swapAddress: string,
  client: CosmWasmClient) => {
  if (!client || !swapAddress) {
    return null
  }
  const queried = await getPoolInfo(swapAddress, client)
  return Number(queried.total_share)
}
export const fetchFlows = async (client, address): Promise<Flow[]> => await getFlowsFromAPI(await client.getChainId(), address) || await client.queryContractSmart(address, { flows: {} })

const getPoolFlowData = async (
  client,
  pools,
  currentEpochData,
  poolAssets,
  prices,
): Promise<IncentivePoolInfo[]> => await (pools
  ? Promise.all(pools.map(async (pool) => {
    if (pool.staking_address === '') {
      return {
        poolId: pool.pool_id,
        flowData: null,
      } // Skip this iteration and continue with the next one.
    }
    const totalLiquidity = pool?.liquidity?.reserves?.totalAssetsInDollar || 0

    const totalPoolLp = await fetchTotalPoolSupply(pool.swap_address,
      client)
    const flows = await fetchFlows(client, pool.staking_address)
    const currentEpochId: number =
      Number(currentEpochData?.currentEpoch?.epoch.id) || 0

    let lockedLpShare: number
    try {
      const weight = await client.queryContractSmart(pool.staking_address,
        {
          global_weight: { epoch_id: currentEpochId },
        })
      const globalWeight = Number(weight?.global_weight)
      lockedLpShare =
        isNaN(globalWeight) || globalWeight === 0
          ? 1
          : globalWeight / totalPoolLp
    } catch {
      lockedLpShare = 1
    }

    const flowList = flows.
      map((flow) => ({
        denom:
          flow.flow_asset.info?.native_token?.denom ??
          flow.flow_asset.info.token.contract_addr,
        dailyEmission: 0,
        endEpoch: Number(flow.end_epoch),
      })).
      filter((flow) => flow.endEpoch >= currentEpochId)

    const uniqueFlowList = flowList.reduce((acc, current) => {
      if (!acc.some((item) => item.denom === current.denom)) {
        acc.push(current)
      }
      return acc
    }, [])
    if (flows.length > 0) {
      flows?.forEach((flow) => {
        if (
          flow.end_epoch >= currentEpochId &&
          flow.start_epoch <= currentEpochId
        ) {
          // Every new entry contains overall emitted token value
          const emittedTokens: number =
            flow.emitted_tokens &&
              Object.keys(flow.emitted_tokens).length !== 0
              ? Math.max(...Object.values(flow.emitted_tokens).map(Number))
              : 0

          const flowDenom =
            flow.flow_asset.info?.token?.contract_addr ??
            flow.flow_asset.info?.native_token?.denom

          const poolAsset = poolAssets.find((asset) => asset.denom === (flow.flow_asset.info?.native_token?.denom ??
            flow.flow_asset.info.token.contract_addr))

          const emission = convertMicroDenomToDenom((Number(flow.flow_asset.amount) - emittedTokens) /
            (flow.start_epoch +
              (flow.end_epoch - flow.start_epoch) -
              Number(currentEpochData.currentEpoch.epoch.id)),
          poolAsset?.decimals || 6)
          const uniqueFlow = uniqueFlowList.find((f) => f.denom === flowDenom)
          uniqueFlow.dailyEmission += emission
        }
      })
    }

    const uniqueFlowsWithEmissionAndApr = uniqueFlowList.map((flow) => {
      const poolAsset = poolAssets.find((asset) => asset.denom === flow.denom)
      const tokenSymbol = poolAsset?.symbol
      const logoURI = poolAsset?.logoURI
      const price = prices[tokenSymbol]
      return {
        ...flow,
        tokenSymbol,
        logoURI,
        apr:
          ((flow.dailyEmission * price * 365.25) /
            (totalLiquidity * lockedLpShare)) *
          100,
      }
    })

    return {
      poolId: pool.pool_id,
      flowData: uniqueFlowsWithEmissionAndApr,
    }
  }))
  : [])

export const useIncentivePoolInfo = (
  client, pools, currentChainPrefix,
) => {
  const { chainId, network } = useRecoilValue(chainState)
  const config: Config = useConfig(network, chainId)
  const prices = usePrices()
  const { data: currentEpochData } = useCurrentEpoch(client, config)
  const [poolsWithAprAnd24HrVolume, setPoolsWithAprAnd24HrVolume] = useState<
    PoolData[]
  >([])

  useEffect(() => {
    const fetchPoolData = async () => {
      switch (chainId) {
        case ChainId.terrac:
          currentChainPrefix = 'terra-classic'
          break
        case ChainId.osmosis:
          currentChainPrefix = 'osmosis';
          break
        default:
          break
      }

      const poolData =
        ((currentChainPrefix === 'terra' && chainId !== ChainId.terrac) || chainId === ChainId.osmosis || chainId === ChainId.injective)
          ? await getPairAprAndDailyVolumeByCoinhall(pools)
          : await getPairAprAndDailyVolumeByEnigma(pools, currentChainPrefix)
      if (poolData[0]?.ratio === 0) {
        console.log('No pair infos found, trying Coinhall')
        const poolDataFromCoinhall = await getPairAprAndDailyVolumeByCoinhall(pools)
        setPoolsWithAprAnd24HrVolume(poolDataFromCoinhall)
      } else {
        setPoolsWithAprAnd24HrVolume(poolData)
      }
    }
    if (pools?.length > 0 && currentChainPrefix) {
      fetchPoolData()
    }
  }, [currentChainPrefix, pools?.length, client])

  let poolAssets = []

  if (Array.isArray(pools)) {
    poolAssets = [].
      concat(...pools.map((pool) => pool.pool_assets)).
      filter((
        v, i, a,
      ) => a.findIndex((t) => t.denom === v.denom) === i)
  }
  const { data: flowPoolData, isLoading } = useQuery(
    ['apr', currentEpochData, pools?.length],
    () => getPoolFlowData(
      client,
      pools,
      currentEpochData,
      poolAssets,
      prices,
    ),
    {
      enabled:
        Boolean(client) &&
        Boolean(currentEpochData) &&
        Boolean(pools) &&
        Boolean(prices),
    },
  )
  return {
    flowPoolData,
    poolsWithAprAnd24HrVolume,
    isLoading,
  }
}
