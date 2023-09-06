import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

export const unbondTokens = (
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
  return signingClient.execute(address, config.whale_lair, handleMsg, 'auto')
}
