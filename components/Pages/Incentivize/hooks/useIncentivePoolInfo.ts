import { useQuery } from 'react-query'
import {
  Config,
  useConfig,
} from 'components/Pages/Dashboard/hooks/useDashboardData'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import usePrices from 'hooks/usePrices'
import { convertMicroDenomToDenom } from 'util/conversion/index'
import { useCurrentEpoch } from 'components/Pages/Incentivize/hooks/useCurrentEpoch'

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
  flowData: FlowData[]

  poolId: string
}
export const useIncentivePoolInfo = (client): IncentivePoolInfo[] => {
  const { chainId, network } = useRecoilValue(walletState)
  const { data: poolsData } = usePoolsListQuery()
  const config: Config = useConfig(network, chainId)
  const prices = usePrices()

  const { data: currentEpochData } = useCurrentEpoch(client, config)
  let poolAssets = []

  if (Array.isArray(poolsData?.pools)) {
    poolAssets = []
      .concat(...poolsData.pools.map((pool) => pool.pool_assets))
      .filter((v, i, a) => a.findIndex((t) => t.denom === v.denom) === i)
  }
  const { data: flowPoolData } = useQuery(
    ['apr', currentEpochData, prices],
    () =>
      getPoolFlowData(client, poolsData, currentEpochData, poolAssets, prices),
    { enabled: !!client && !!currentEpochData && !!poolsData && !!prices }
  )
  return flowPoolData
}

const fetchFlows = async (client, address): Promise<Flow[]> => {
  return await client.queryContractSmart(address, { flows: {} })
}

const getPoolFlowData = async (
  client,
  poolsData,
  currentEpochData,
  poolAssets,
  prices
): Promise<IncentivePoolInfo[]> => {
  const poolFlowData = poolsData?.pools
    ? await Promise.all(
        poolsData?.pools.map(async (pool) => {
          if (pool.staking_address === '') {
            return {
              poolId: pool.pool_id,
              flowData: null,
            } // Skip this iteration and continue with the next one.
          }
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
                const emittedTokens: number = Object.values(
                  flow.emitted_tokens
                ).reduce((acc: number, value: number) => acc + Number(value), 0)

                const flowDenom =
                  flow.flow_asset.info?.token?.contract_addr ??
                  flow.flow_asset.info?.native_token?.denom
                const tokenSymbol = poolAssets.find(
                  (asset) => asset.denom === flowDenom
                ).symbol

                const emission =
                  convertMicroDenomToDenom(
                    Number(flow.flow_asset.amount) -
                      emittedTokens / flow.start_epoch +
                      (flow.end_epoch - flow.start_epoch) -
                      Number(currentEpochData.currentEpoch.epoch.id),
                    6
                  ) * prices[tokenSymbol]

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
            const tokenSymbol = poolAsset.symbol
            const logoURI = poolAsset.logoURI
            return {
              ...flow,
              tokenSymbol: tokenSymbol,
              logoURI: logoURI,
              apr:
                ((flow.dailyEmission * 365.25) /
                  (pool.liquidity?.providedTotal?.dollarValue | 1)) *
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

  return poolFlowData
}
