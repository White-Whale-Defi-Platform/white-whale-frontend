import { useEffect, useMemo, useState } from 'react'
import { useQueries, useQuery } from 'react-query'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react-lite'
import useEpoch from 'components/Pages/Trade/Incentivize/hooks/useEpoch'
import { fetchFlows } from 'components/Pages/Trade/Incentivize/hooks/useIncentivePoolInfo'
import { queryPoolInfo } from 'components/Pages/Trade/Pools/hooks/queryPoolInfo'
import { PoolEntityType, usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import {
  DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
} from 'constants/index'
import { IncentiveState } from 'constants/state'
import { useClients } from 'hooks/useClients'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { fromChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { queryLiquidityBalance } from 'services/liquidity'
import { chainState } from 'state/chainState'
import { convertMicroDenomToDenom, protectAgainstNaN } from 'util/conversion'
import { queryAllStakedBalances } from '../../Liquidity/hooks/useLiquidityAlliancePositions'

export type AssetType = [number?, number?]

export type PoolTokenValue = {
  tokenAmount: number
  dollarValue: number
}

export type PoolState = {
  total: PoolTokenValue
  provided: PoolTokenValue
}

type TokenInfo = {
  token_info: any
}

export type Flow = {
  token: TokenInfo
  endTime: number
  startTime: number
  flowId: number
  amount: string
  state: IncentiveState.active | IncentiveState.over
}

export type PoolLiquidityState = {
  available: PoolState
  staked: PoolState

  providedTotal: PoolTokenValue

  reserves: {
    myNotLocked: AssetType
    totalLocked: AssetType
    myLocked: AssetType
    total: AssetType
    totalAssetsInDollar: number
    ratioFromPool: number
  }
  myFlows: Flow[]
}

export type PoolEntityTypeWithLiquidity = PoolEntityType & {
  liquidity?: PoolLiquidityState
  flows?: any
}

export type QueryMultiplePoolsArgs = {
  pools: Array<PoolEntityTypeWithLiquidity>
  refetchInBackground?: boolean
  cosmWasmClient: CosmWasmClient
}

const queryMyLiquidity = async ({
  swap,
  address,
  cosmWasmClient,
  totalLockedLp,
  myLockedLp,
  prices,
}) => {
  const tokenASymbol = swap?.assetOrder[0]
  const tokenADecimals = swap.pool_assets?.[0]?.decimals
  const tokenBSymbol = swap?.assetOrder[1]
  const tokenBDecimals = swap.pool_assets?.[1]?.decimals
  const isNative = isNativeToken(swap.lp_token)
  const myNotLockedLp = address
    ? await queryLiquidityBalance({
      tokenAddress: swap.lp_token,
      cosmWasmClient,
      address,
      isNative,
    })
    : 0

  const totalAssets: [number, number] = [
    protectAgainstNaN(swap.token1_reserve),
    protectAgainstNaN(swap.token2_reserve),
  ]
  const totalAssetsInDollar: [number, number] = [
    convertMicroDenomToDenom(protectAgainstNaN(swap.token1_reserve), tokenADecimals) * (prices?.[tokenASymbol] || 0),
    convertMicroDenomToDenom(protectAgainstNaN(swap.token2_reserve), tokenBDecimals) * (prices?.[tokenBSymbol] || 0),
  ]

  const myNotLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myNotLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myNotLockedLp / swap.lp_token_supply)),
  ]
  const totalLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (totalLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (totalLockedLp / swap.lp_token_supply)),
  ]

  const myLockedAssets: [number, number] = [
    protectAgainstNaN(totalAssets[0] * (myLockedLp / swap.lp_token_supply)),
    protectAgainstNaN(totalAssets[1] * (myLockedLp / swap.lp_token_supply)),
  ]

  return {
    totalAssets,
    totalAssetsInDollar: (totalAssetsInDollar[0] + totalAssetsInDollar[1]),
    ratioFromPool: convertMicroDenomToDenom(swap.token2_reserve, tokenBDecimals) / convertMicroDenomToDenom(swap.token1_reserve, tokenADecimals),
    myNotLockedAssets,
    myLockedAssets,
    totalLockedAssets,
    myNotLockedLp,
  }
}

interface Pool {
  staking_address?: string;
  lp_token?: string;
}

interface Position {
  open_position?: {
    amount: string;
  };
  closed_position?: {
    amount: string;
  };
}

interface FetchParams {
  pools: Pool[];
  cosmWasmClient: CosmWasmClient;
  address: string;
  chain_id: string;
}

const fetchLockedLp = async ({ pools, cosmWasmClient, address, chain_id }: FetchParams): Promise<Map<string, number>> => {
  const newMap = new Map<string, number>();

  if (!pools || !cosmWasmClient || !address || chain_id !== 'phoenix-1') {
    return newMap;
  }

  for (const pool of pools) {
    // Fetch staking positions
    let stakingPositions: Position[] = [];
    if (pool.staking_address) {
      stakingPositions = await fetchStakingPositions(pool.staking_address, cosmWasmClient, address);
    }

    // Fetch alliance positions
    let filteredAlliancePositions: any[] = [];
    if (chain_id === 'phoenix-1') {
      filteredAlliancePositions = (await queryAllStakedBalances(cosmWasmClient, address))?.filter(
        (position: any) => position.open_position?.lp === pool.lp_token
      ) || [];
    }

    // Combine and sum up all positions
    const totalLocked = sumPositions(stakingPositions) + sumPositions(filteredAlliancePositions);
    newMap.set(pool.lp_token as string, totalLocked);
  }

  return newMap;
};

export const useFetchMyLockedLps = ({ pools, cosmWasmClient, address, chain_id }: FetchParams) => {
  return useQuery<Map<string, number>, Error>(
    ['lockedLps', pools, address, chain_id],
    () => fetchLockedLp({ pools, cosmWasmClient, address, chain_id }),
    {
      enabled: !!pools && !!cosmWasmClient && !!address,
      staleTime: 60000, // 1 minute
      refetchInterval: 60000, // 1 minute
    }
  );
};



const fetchStakingPositions = async (stakingAddress: string, cosmWasmClient: CosmWasmClient, address: string): Promise<Position[]> => {
  const { positions = [] } = await cosmWasmClient.queryContractSmart(stakingAddress, {
    positions: { address },
  }) || {};

  return positions;
};

const sumPositions = (positions: Position[]): number => {
  return positions.reduce((acc, p) => {
    const openAmount = Number(p.open_position?.amount || 0);
    const closedAmount = Number(p.closed_position?.amount || 0);
    return acc + openAmount + closedAmount;
  }, 0);
};

export const fetchTotalLockedLp = async (
  incentiveAddress: string,
  lpAddress: string,
  client: CosmWasmClient,
) => {
  if (!client || !incentiveAddress || !lpAddress) {
    return null
  }

  const { balance, amount } = isNativeToken(lpAddress)
    ? await client.getBalance(incentiveAddress, lpAddress)
    : await client.queryContractSmart(lpAddress, {
      balance: { address: incentiveAddress },
    })

  return Number(balance || amount)
}
export const useQueryPoolsLiquidity = ({
  pools,
  refetchInBackground = false,
  cosmWasmClient,
}: QueryMultiplePoolsArgs) => {
  const prices = usePrices();
  const { walletChainName, chainId } = useRecoilValue(chainState);
  const { address } = useChain(walletChainName);
  const {data: lps, isLoading} = useFetchMyLockedLps({ pools, cosmWasmClient, address, chain_id: chainId });
  const [tokenList] = useTokenList();
  const { epochToDate, currentEpoch } = useEpoch();



  const queryPoolLiquidity = async (pool: PoolEntityType): Promise<PoolEntityTypeWithLiquidity | any> => {
    if (!cosmWasmClient) return pool;

    const poolInfo = await queryPoolInfo({
      cosmWasmClient,
      swap_address: pool.swap_address,
    });

    const getTokenDenom = (assetInfo) =>
      assetInfo?.info?.native_token?.denom ?? assetInfo?.info?.token?.contract_addr;

    const tokenA = pool.pool_assets.find((asset) => asset.denom === getTokenDenom(poolInfo?.assets[0]));
    const tokenB = pool.pool_assets.find((asset) => asset.denom === getTokenDenom(poolInfo?.assets[1]));

    const fetchFlowsForPool = async (): Promise<any[]> => {
      if (!cosmWasmClient || !pool?.staking_address || tokenList.tokens.length === 0) return [];

      const flows = await fetchFlows(cosmWasmClient, pool.staking_address);
      return flows?.map((flow) => {
        const denom = flow?.flow_asset?.info?.token?.contract_addr || flow?.flow_asset?.info.native_token?.denom;
        return tokenList.tokens.find((t) => t?.denom === denom);
      });
    };

    const fetchMyFlowsForPool = async (): Promise<any[]> => {
      if (!cosmWasmClient || !pool?.staking_address || tokenList.tokens.length === 0) return [];

      const flows = await fetchFlows(cosmWasmClient, pool.staking_address);
      return flows?.map((flow) => {
        const denom = flow.flow_asset.info?.token?.contract_addr || flow.flow_asset.info?.native_token?.denom;
        const token = tokenList.tokens.find((t) => t?.denom === denom);
        const startEpoch = flow.start_epoch;
        const endEpoch = flow.end_epoch;

        const getState = () => {
          if (currentEpoch >= startEpoch && currentEpoch < endEpoch) return IncentiveState.active;
          if (currentEpoch < startEpoch) return IncentiveState.upcoming;
          if (currentEpoch >= endEpoch) return IncentiveState.over;
          return '';
        };

        return {
          token,
          isCreator: flow.flow_creator === address,
          endTime: epochToDate(endEpoch),
          startTime: epochToDate(startEpoch),
          flowId: flow.flow_id,
          amount: flow.flow_asset.amount,
          state: getState(),
        };
      }).filter(Boolean);
    };

    const [flows, myFlows] = await Promise.all([fetchFlowsForPool(), fetchMyFlowsForPool()]);
    const myLockedLp = lps?.get(pool.lp_token) || 0;
    const totalLockedLp = await fetchTotalLockedLp(pool.staking_address, pool.lp_token, cosmWasmClient);

    const {
      myNotLockedAssets,
      totalLockedAssets,
      myLockedAssets,
      totalAssets,
      totalAssetsInDollar,
      ratioFromPool,
      myNotLockedLp,
    } = await queryMyLiquidity({
      cosmWasmClient,
      swap: { ...poolInfo, ...pool },
      address,
      totalLockedLp,
      myLockedLp,
      prices,
    });

    const calculateLiquidityValues = (assets: any, lpTokenAmount = null) => ({
      tokenAmount: lpTokenAmount ?? (assets[1] + assets[0]),
      dollarValue:
        (Number(fromChainAmount(assets[0], tokenA?.decimals)) * (prices?.[tokenA?.symbol] || 0)) +
        (Number(fromChainAmount(assets[1], tokenB?.decimals)) * (prices?.[tokenB?.symbol] || 0)),
    });

    const myNotLockedLiquidity = calculateLiquidityValues(myNotLockedAssets, myNotLockedLp);
    const totalLockedLiquidity = calculateLiquidityValues(totalLockedAssets);
    const myLockedLiquidity = calculateLiquidityValues(myLockedAssets);

    const liquidity = {
      available: {
        totalLpAmount: poolInfo.lp_token_supply,
        provided: myNotLockedLiquidity,
      },
      locked: {
        total: totalLockedLiquidity,
        mine: myLockedLiquidity,
      },
      providedTotal: {
        tokenAmount: myNotLockedLiquidity.tokenAmount + myLockedLiquidity.tokenAmount,
        dollarValue: myNotLockedLiquidity.dollarValue + myLockedLiquidity.dollarValue,
      },
      myFlows,
      reserves: {
        myNotLocked: myNotLockedAssets,
        totalLocked: totalLockedAssets,
        myLocked: myLockedAssets,
        total: totalAssets as AssetType,
        totalAssetsInDollar,
        ratioFromPool,
      },
    };

    return { ...pool, flows, liquidity };
  };

  return useQueries(
    (pools ?? []).map((pool) => ({
      queryKey: `@pool-liquidity/${pool.pool_id}/${address}`,
      enabled:
        Boolean(cosmWasmClient && pool.pool_id && tokenList?.tokens.length > 0) &&
        Boolean(prices) && !isLoading,
      refetchOnMount: false,
      refetchInterval: refetchInBackground ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL : null,
      refetchIntervalInBackground: refetchInBackground,
      cacheTime: 5 * 60 * 1000,
      queryFn: () => queryPoolLiquidity(pool),
    }))
  );
};


export const useQueryPoolLiquidity = ({ poolId }) => {
  const { data: poolsListResponse, isLoading: loadingPoolsList } =
    usePoolsListQuery()
  const { walletChainName } = useRecoilValue(chainState)
  const { cosmWasmClient } = useClients(walletChainName)

  const poolToFetch = useMemo(() => {
    const pool = poolsListResponse?.poolsById[poolId]
    return pool ? [pool] : null
  }, [poolId, poolsListResponse])

  const [poolResponse] = useQueryPoolsLiquidity({
    pools: poolToFetch,
    refetchInBackground: true,
    cosmWasmClient,
  })
  console.log('Pool Response: ', poolResponse?.data)

  return [
    poolResponse?.data,
    poolResponse?.isLoading || loadingPoolsList,
    poolResponse?.isError,
  ] as const
}

