type ApiResponse = Record<string, { usd: number }>

const network = {
  "uni-3": "juno-network",
  "juno-1": "juno-network",
  "phoenix-1": "terra-luna-2",
  "pisco-1": "terra-luna-2"
}

export const fetchDollarPriceByTokenIds = debounce(
  async (tokenIds: Array<string>, chainId): Promise<ApiResponse> => {
    const apiIds = tokenIds.flat().join(',')

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${network[chainId]}&vs_currencies=usd`,
      // `https://api.coingecko.com/api/v3/simple/price?ids=juno-network&vs_currencies=usd`,
      {
        method: 'GET',
      }
    )

    return response.json()
  },
  100
)

function debounce<T extends (args: any, chainId: string) => Promise<any>>(
  getPromise: T,
  timeoutMs: number
) {
  let timeout
  let argsState = []
  let resolvers = []

  const debouncedPromise = (args: Parameters<T>, chainId) => {
    argsState.push(args)

    return new Promise((resolve, reject) => {
      resolvers.push([resolve, reject])

      clearTimeout(timeout)
      timeout = setTimeout(function resolvePromises() {
        const promise = getPromise([...argsState], chainId)
        resolvers.forEach((promiseResolvers) =>
          promise.then(...promiseResolvers)
        )

        resolvers = []
        argsState = []
      }, timeoutMs)
    })
  }

  return debouncedPromise as T
}
