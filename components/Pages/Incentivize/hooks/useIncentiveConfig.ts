import { useEffect, useState } from 'react'
export interface IncentiveConfig {
  incentive_factory_address: string
  fee_distributor_address: string
}
export const useIncentiveConfig = (network: string, chainId: string) => {
  const [config, setConfig] = useState<IncentiveConfig | null>(null)

  useEffect(() => {
    if (network && chainId) {
      // Only execute if network and chainId are defined
      const fetchConfig = async () => {
        try {
          const response = await fetch(
            `/${network}/${chainId}/incentive_config.json`
          )
          const json: IncentiveConfig = await response.json()
          setConfig(json)
        } catch (error) {
          console.error('Failed to load config:', error)
        }
      }
      fetchConfig()
    }
  }, [network, chainId])

  return config
}
