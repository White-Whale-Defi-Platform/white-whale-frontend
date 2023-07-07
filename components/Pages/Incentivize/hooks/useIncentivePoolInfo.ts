import { useQuery } from 'react-query'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import usePrices from 'hooks/usePrices'
import { convertMicroDenomToDenom } from 'util/conversion/index'
import { useCurrentEpoch } from 'components/Pages/Incentivize/hooks/useCurrentEpoch'
import {
  EnigmaPoolData,
  getPairAprAndDailyVolume,
  getPairAprAndDailyVolumeTerra,
} from 'util/enigma'
import { useEffect, useState } from 'react'

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
}
export interface IncentivePoolInfo {
  flowData?: FlowData[]

  poolId: string
}
export const useIncentivePoolInfo = (client, pools, currentChainPrefix) => {
  const { chainId, network } = useRecoilValue(walletState)
  const config: Config = useConfig(network, chainId)
  const prices = usePrices()
  const { data: currentEpochData } = useCurrentEpoch(client, config)
  const [poolsWithAprAnd24HrVolume, setPoolsWithAprAnd24HrVolume] = useState<
    EnigmaPoolData[]
  >([])

  useEffect(() => {
    const fetchPoolData = async () => {
      const poolData =
        currentChainPrefix === 'terra'
          ? await getPairAprAndDailyVolumeTerra(pools)
          : await getPairAprAndDailyVolume(pools, currentChainPrefix)
      setPoolsWithAprAnd24HrVolume(poolData)
    }
    if (pools?.length > 0 && currentChainPrefix) fetchPoolData()
  }, [currentChainPrefix, pools?.length, client])

  let poolAssets = []

  if (Array.isArray(pools)) {
    poolAssets = []
      .concat(...pools.map((pool) => pool.pool_assets))
      .filter((v, i, a) => a.findIndex((t) => t.denom === v.denom) === i)
  }
  const { data: flowPoolData, isLoading } = useQuery(
    ['apr', currentEpochData, prices, pools, poolsWithAprAnd24HrVolume],
    () =>
      getPoolFlowData(
        client,
        pools,
        currentEpochData,
        poolAssets,
        prices,
        poolsWithAprAnd24HrVolume
      ),
    {
      enabled:
        !!client &&
        !!currentEpochData &&
        !!pools &&
        !!prices &&
        !!poolsWithAprAnd24HrVolume,
    }
  )
  return { flowPoolData, poolsWithAprAnd24HrVolume, isLoading }
}

const fetchFlows = async (client, address): Promise<Flow[]> => {
  return await client?.queryContractSmart(address, { flows: {} })
}
const fetchGlobalIncentiveWeight = async (
  client,
  epochId,
  incentiveAddress
) => {
  const { global_weight } = await client.queryContractSmart(incentiveAddress, {
    global_weight: { epoch_id: Number(epochId) },
  })
  return Number(global_weight)
}

const getPoolFlowData = async (
  client,
  pools,
  currentEpochData,
  poolAssets,
  prices,
  poolsWithAprAnd24HrVolume
): Promise<IncentivePoolInfo[]> => {
  return pools
    ? await Promise.all(
        pools?.map(async (pool) => {
          if (pool.staking_address === '') {
            return {
              poolId: pool.pool_id,
              flowData: null,
            } // Skip this iteration and continue with the next one.
          }
          const totalLiquidity = poolsWithAprAnd24HrVolume.find(
            (p) => p.pool_id === pool.pool_id
          )?.totalLiquidity
          const flows = await fetchFlows(client, pool.staking_address)

          const currentEpochIdCheck: number = Number(
            currentEpochData?.currentEpoch?.epoch.id
          )
          const currentEpochId: number = isNaN(currentEpochIdCheck)
            ? 0
            : currentEpochIdCheck

          const flowList = flows.map((flow) => {
            return {
              denom:
                flow.flow_asset.info?.native_token?.denom ??
                flow.flow_asset.info.token.contract_addr,
              dailyEmission: 0,
            }
          })
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
                // every new entry contains overall emitted token value
                const emittedTokens: number = Math.max(
                  ...Object.values(flow.emitted_tokens).map(Number)
                )

                const flowDenom =
                  flow.flow_asset.info?.token?.contract_addr ??
                  flow.flow_asset.info?.native_token?.denom

                const emission = convertMicroDenomToDenom(
                  (Number(flow.flow_asset.amount) - emittedTokens) /
                    (Number(flow.start_epoch) +
                      (Number(flow.end_epoch) - Number(flow.start_epoch)) -
                      Number(currentEpochData.currentEpoch.epoch.id)),
                  6
                )
                const uniqueFlow = uniqueFlowList.find(
                  (f) => f.denom === flowDenom
                )
                uniqueFlow.dailyEmission += emission
              }
            })
          }
          const uniqueFlowsWithEmissionAndApr = uniqueFlowList.map((flow) => {
            const poolAsset = poolAssets.find(
              (asset) => asset.denom === flow.denom
            )
            const tokenSymbol = poolAsset?.symbol
            const logoURI = poolAsset?.logoURI

            return {
              ...flow,
              tokenSymbol: tokenSymbol,
              logoURI: logoURI,
              apr:
                ((flow.dailyEmission * Number(prices[tokenSymbol]) * 365.25) /
                  (totalLiquidity * 4)) *
                100,
            }
          })

          return {
            poolId: pool.pool_id,
            flowData: uniqueFlowsWithEmissionAndApr,
          }
        })
      )
    : []
}
