import { useQuery } from 'react-query'

import { STATE } from 'components/Pages/Trade/Liquidity/Positions'
import dayjs from 'dayjs'
import usePrices from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { TokenInfo } from 'queries/usePoolsListQuery'
import { useQueryPoolLiquidity } from 'queries/useQueryPoolsLiquidity'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { protectAgainstNaN } from 'util/conversion/index'
import { formatSeconds } from 'util/formatSeconds'

export type Position = {
  poolId: string
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

export const lpPositionToAssets = ({
  totalAssets,
  totalLpSupply,
  myLockedLp,
}) => [
  protectAgainstNaN(totalAssets[0] * (myLockedLp / totalLpSupply)),
  protectAgainstNaN(totalAssets[1] * (myLockedLp / totalLpSupply)),
]
export const fetchPositions = async (
  poolId,
  client,
  prices,
  incentiveAddress,
  address,
  pool_assets,
  totalAssets,
  totalLpSupply,
) => {
  const data = await client?.queryContractSmart(incentiveAddress, {
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
        const isWithdraw = poolId === 'ampLUNA-LUNA' || poolId === 'bLUNA-LUNA'
        return {
          ...position,
          duration: position.formatedTime,
          weight: position.weight,
          assets,
          value: assets.reduce((acc, asset) => acc + Number(asset.dollarValue),
            0),
          state: position.isOpen
            ? STATE.ACTIVE
            : diff <= 0
              ? STATE.UNBONDED
              : isWithdraw ? STATE.WITHDRAW : STATE.UNBONDING,
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
  const totalReserve = liquidity?.reserves?.total || [0, 0]
  const { address, client } = useRecoilValue(walletState)
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
    queryFn: (): Promise<Position[]> => fetchPositions(
      poolId,
      client,
      prices,
      staking_address,
      address,
      pool_assets,
      totalReserve,
      totalLpSupply,
    ),
    enabled: Boolean(address) && Boolean(client) && Boolean(staking_address),
  })
}

export default useLockedPositions
