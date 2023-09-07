import { useQuery } from 'react-query'

export type IBCAssetInfo = {
  id: string
  address_prefix: string
  name: string
  symbol: string
  chain_id: string
  rpc: string
  denom: string
  decimals: number
  juno_denom: string
  juno_channel: string
  channel: string
  logoURI: string
  deposit_gas_fee?: number
  external_deposit_uri?: string
}

export type IBCAssetList = {
  tokens: Array<IBCAssetInfo>
}

export const useIBCAssetList = () => {
  const { data, isLoading } = useQuery<IBCAssetList>(
    '@ibc-asset-list',
    async () => {
      const response = await (
        await fetch(process.env.NEXT_PUBLIC_IBC_ASSETS_URL)
      ).json()
      return response
    },
    {
      onError(e) {
        console.error('Error loading ibc asset list:', e)
      },
      refetchOnMount: false,
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 60,
    },
  )

  return [data, isLoading] as const
}
