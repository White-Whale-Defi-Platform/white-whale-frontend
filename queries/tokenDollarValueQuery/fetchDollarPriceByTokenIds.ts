type ApiResponse = Record<string, { usd: number }>

export const fetchDollarPriceByTokenIds = debounce(
  async (tokenIds: Array<string>): Promise<ApiResponse> => {
    const apiIds = tokenIds.flat().join(',')

    try {
      const response = await fetch(
        // `https://api.coingecko.com/api/v3/simple/price?ids=${chainId}&vs_currencies=usd`,
        `https://api.coingecko.com/api/v3/simple/price?ids=${apiIds}&vs_currencies=usd`,
        {
          method: 'GET',
        }
      )
      if (response.status === 200) {
        return response.json()
      } else {
        return {}
      }
    } catch (error) {
      return {}
    }
  },
  100
)

function debounce<T extends (args: any) => Promise<any>>(
  getPromise: T,
  timeoutMs: number
) {
  let timeout
  let argsState = []
  let resolvers = []

  const debouncedPromise = (args: Parameters<T>) => {
    argsState.push(args)

    return new Promise((resolve, reject) => {
      resolvers.push([resolve, reject])

      clearTimeout(timeout)
      timeout = setTimeout(function resolvePromises() {
        const promise = getPromise([...argsState])
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
