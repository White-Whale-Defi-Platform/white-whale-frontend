import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react-lite'
import { PoolEntityType, TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { useQueryPoolLiquidity } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { WalletChainName } from 'constants/index'
import { PositionState } from 'constants/state'
import dayjs from 'dayjs'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { protectAgainstNaN } from 'util/conversion/index'
import { formatSeconds } from 'util/formatSeconds'

import { useLiquidityAlliancePositions } from './useLiquidityAlliancePositions'

export type Position = {
  poolId: string
  amount: number
  weight: string
  duration: string
  unbonding_duration: number
  assets: TokenInfo & { dollarValue: number; amount: number }[]
  value: number
  state: string
  action: null
  isOpen: boolean
  formattedTime: string
}

export const lpPositionToAssets = ({
  totalAssets,
  totalLpSupply,
  myLockedLp,
}) => [
  protectAgainstNaN(totalAssets[0] * (myLockedLp / totalLpSupply)),
  protectAgainstNaN(totalAssets[1] * (myLockedLp / totalLpSupply)),
]
export const fetchPositions = async (
  walletChainName: WalletChainName,
  cosmWasmClient: CosmWasmClient,
  prices: any,
  incentiveAddress: string,
  address: string,
  poolAssets: any[],
  totalAssets: any,
  totalLpSupply: any,
  alliancePositions?: any,
) => {
  // Address can be undefined
  if (!address) {
    return []
  }
  let data = { positions: [] }
  if (incentiveAddress) {
    data = await cosmWasmClient?.queryContractSmart(incentiveAddress, {
      positions: { address },
    })
  }
  const allPositions = [...data.positions, ...alliancePositions || []]
  return allPositions.map((p) => {
    const positions = []

    // Open position
    const open = { ...(p?.open_position || {}) }
    open.formatedTime = formatSeconds(open.unbonding_duration)
    open.isOpen = true
    if (p?.open_position) {
      positions.push(open)
    }

    // Closed position
    const close = { ...(p?.closed_position || {}) }
    const today = dayjs(new Date())
    const unbonding = dayjs.unix(close.unbonding_timestamp)
    const diff = unbonding.diff(today, 'second')
    close.formatedTime = formatSeconds(diff)
    close.isOpen = false
    if (p?.closed_position) {
      positions.push(close)
    }
    return positions.map((position) => {
      const lpAssets = lpPositionToAssets({
        totalAssets,
        totalLpSupply,
        myLockedLp: position.amount,
      })
      const assets = poolAssets.map((asset, i) => {
        const assetAmount = fromChainAmount(lpAssets[i], asset.decimals)
        const dollarValue = Number(assetAmount) * (prices?.[asset.symbol] || 0)
        return {
          ...asset,
          amount: parseFloat(assetAmount),
          dollarValue,
        }
      })
      return {
        ...position,
        duration: position.isOpen ? (open.unbonding_duration === -1 ? 'Alliance' : position.formatedTime) : position.formatedTime,
        weight: position.weight,
        assets,
        value: assets.reduce((acc, asset) => acc + Number(asset.dollarValue),
          0),
        state: position.isOpen
          ? PositionState.active
          : diff <= 0
            ? PositionState.unbonded
            : PositionState.withdraw,
        action: null,
      }
    })
  }).flat()
}
const useLockedPositions = (pool: PoolEntityType) => {
  const [{ liquidity = {}, pool_assets: poolAssets = [] } = {}] =
    useQueryPoolLiquidity({ poolId: pool?.pool_id })
  const { data: alliancePositions, isLoading } = useLiquidityAlliancePositions(pool?.lp_token)
  const totalLpSupply = liquidity?.available?.totalLpAmount || 0
  const totalReserve = liquidity?.reserves?.total || [0, 0]
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)
  const tokens = useTokenList()
  const prices = usePrices()

  return useQuery({
    queryKey: [
      'positions',
      address,
      pool?.staking_address,
      pool?.pool_id,
      tokens,
      poolAssets,
      prices,
      alliancePositions,
    ],
    queryFn: (): Promise<Position[]> => fetchPositions(
      walletChainName as WalletChainName,
      cosmWasmClient,
      prices,
      pool?.staking_address,
      address,
      poolAssets,
      totalReserve,
      totalLpSupply,
      alliancePositions,
    ),
    enabled: Boolean(address) && Boolean(cosmWasmClient) && !isLoading,
  })
}

export default useLockedPositions
