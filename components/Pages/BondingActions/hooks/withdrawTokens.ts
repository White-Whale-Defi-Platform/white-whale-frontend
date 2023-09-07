import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'

export const withdrawTokens = async (
  signingClient: SigningCosmWasmClient,
  address: string,
  denom: string,
  config: Config,
) => {
  const handleMsg = {
    withdraw: {
      denom,
    },
  }
  return await signingClient.execute(
    address, config.whale_lair, handleMsg, 'auto',
  )
}
