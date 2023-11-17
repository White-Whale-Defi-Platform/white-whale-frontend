type ApiResponse = Record<string, { usd: number }>

const debounce = (getPromise: any,
  timeoutMs: number) => {
  let timeout
  let argsState = []
  let resolvers = []

  return (args: any) => {
    argsState.push(args)

    return new Promise((resolve, reject) => {
      resolvers.push([resolve, reject])

      clearTimeout(timeout)
      timeout = setTimeout(function resolvePromises() {
        const promise = getPromise([...argsState])
        resolvers.forEach((promiseResolvers) => promise.then(...promiseResolvers))

        resolvers = []
        argsState = []
      }, timeoutMs)
    })
  }
}

export const fetchDollarPriceByTokenIds = debounce(async (tokenIds: Array<string>): Promise<ApiResponse> => {
  const apiIds = tokenIds.flat()
  const newApiIds = [...new Set(apiIds)].join(',')

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${newApiIds}&vs_currencies=usd`,
      {
        method: 'GET',
        cache: 'force-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    if (response.status === 200) {
      return await response.json()
    }
    return {}
  } catch (error) {
    return {}
  }
},
1000)

