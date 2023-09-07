import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const unbondTokens = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  amount: number,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    unbond: {
      asset: {
        amount: amount.toString(),
        info: {
          native_token: {
            denom: denom,
          },
        },
      },
    },
  }
  return await signingClient.execute(
    address, config.whale_lair, handleMsg, 'auto',
  )
}
