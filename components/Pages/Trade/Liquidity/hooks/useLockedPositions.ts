import { useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react-lite'
import dayjs from 'dayjs'
import { useClients } from 'hooks/useClients'
import usePrices from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { TokenInfo } from 'queries/usePoolsListQuery'
import { useQueryPoolLiquidity } from 'queries/useQueryPoolsLiquidity'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { protectAgainstNaN } from 'util/conversion/index'
import { formatSeconds } from 'util/formatSeconds'

type Params = {
  cosmWasmClient: CosmWasmClient
  prices: any
  incentiveAddress: string
  address: string
  pool_assets: TokenInfo[]
  totalAssets: number[]
  totalLpSupply: number
}
export type Position = {
  amount: number
  weight: string
  duration: string
  unbonding_duration: number
  assets: TokenInfo & { dollarValue: number; assetAmount: number }[]
  value: number
  state: string
  action: null
  isOpen: boolean
  formattedTime: string
}
export enum PositionState {
  unbonding = 'unbonding',
  active = 'active',
  unbonded = 'unbonded',
}
export const lpPositionToAssets = ({
  totalAssets,
  totalLpSupply,
  myLockedLp,
}) => [
  protectAgainstNaN(totalAssets[0] * (myLockedLp / totalLpSupply)),
  protectAgainstNaN(totalAssets[1] * (myLockedLp / totalLpSupply)),
]
export const fetchPositions = async ({
  cosmWasmClient,
  prices,
  incentiveAddress,
  address,
  pool_assets,
  totalAssets,
  totalLpSupply,
}: Params) => {
  const data = await cosmWasmClient?.queryContractSmart(incentiveAddress, {
    positions: { address },
  })
  return data.positions.
    map((p) => {
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
        const assets = pool_assets.map((asset, i) => {
          const assetAmount = fromChainAmount(lpAssets[i], asset.decimals)
          const dollarValue = Number(assetAmount) * prices?.[asset.symbol] || 0
          return {
            ...asset,
            assetAmount: parseFloat(assetAmount),
            dollarValue,
          }
        })
        return {
          ...position,
          duration: position.formatedTime,
          weight: position.weight,
          assets,
          value: assets.reduce((acc, asset) => acc + Number(asset.dollarValue),
            0),
          state: position.isOpen
            ? PositionState.active
            : diff <= 0
              ? PositionState.unbonded
              : PositionState.unbonding,
          action: null,
        }
      })
    }).
    flat()
}
const useLockedPositions = (poolId: string) => {
  const [{ liquidity = {}, pool_assets = [], staking_address = null } = {}] =
    useQueryPoolLiquidity({ poolId })
  const totalLpSupply = liquidity?.available?.totalLpAmount || 0
  const totalAssets = liquidity?.reserves?.total || [0, 0]
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { cosmWasmClient } = useClients(walletChainName)
  const tokens = useTokenList()
  const prices = usePrices()

  return useQuery({
    queryKey: [
      'positions',
      address,
      staking_address,
      poolId,
      tokens,
      pool_assets,
      prices,
    ],
    queryFn: (): Promise<Position[]> => fetchPositions({
      cosmWasmClient,
      prices,
      incentiveAddress: staking_address,
      address,
      pool_assets,
      totalAssets,
      totalLpSupply,
    }),
    enabled: Boolean(address) && Boolean(cosmWasmClient) && Boolean(staking_address),

  })
}

export default useLockedPositions
