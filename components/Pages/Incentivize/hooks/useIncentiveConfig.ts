import { useEffect, useState } from 'react'

export interface IncentiveConfig {
  incentive_factory_address: string
  fee_distributor_address: string
  frontend_helper_address: string
}

export const useIncentiveConfig = (network: string, chainId: string) => {
  const [config, setConfig] = useState<IncentiveConfig | null>(null)
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false)

  useEffect(() => {
    if (network && chainId) {
      // Only execute if network and chainId are defined
      const fetchConfig = async () => {
        try {
          const response = await fetch(
            `/${network}/${chainId}/incentive_config.json`
          )

          if (!response.ok) {
            setIsSuccessful(false)
            return
          }

          const json: IncentiveConfig = await response.json()
          setConfig(json)
          setIsSuccessful(true)
        } catch (error) {
          console.error('Failed to load config:', error)
          setIsSuccessful(false)
        }
      }

      fetchConfig()
    }
  }, [network, chainId])

  return { config, isSuccessful }
}
