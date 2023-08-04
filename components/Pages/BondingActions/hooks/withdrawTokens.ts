import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

export const withdrawTokens = (
  signingClient: SigningCosmWasmClient,
  address: string,
  denom: string,
  config: Config
) => {
  const handleMsg = {
    withdraw: {
      denom: denom,
    },
  }
  return signingClient.execute(address, config.whale_lair, handleMsg, 'auto')
}
