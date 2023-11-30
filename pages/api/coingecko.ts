let cache = {}
let initialized = false
const fetchInterval = 60 * 1000 // 60 seconds
const coinGeckoIds = ['white-whale', 'chihuahua-token', 'lion-dao', 'terra-luna', 'comdex', 'cosmos', 'injective-protocol', 'juno-network', 'sei-network', 'terra-luna-2', 'wrapped-bitcoin']

const fetchDataFromCoinGecko = async () => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status code ${response.status}`)
    }
    const newData = await response.json();

    // Check if the new data is not empty
    if (Object.keys(newData).length !== 0) {
      return newData
    }
  } catch (error) {
    console.error('Fetch to CoinGecko API failed:', error);
    // Don't update the cache if there's an error
  }
  return null
};

// Perform the initial fetch immediately on server start
fetchDataFromCoinGecko().then((data) => {
  if (data) {
    cache = data
    initialized = true
  }
})

setInterval(async () => {
  const newData = await fetchDataFromCoinGecko();
  if (newData) {
    Object.keys(newData).forEach((id) => {
      if (coinGeckoIds.includes(id)) {
        cache[id] = newData[id];
      }
    })
  }
}, fetchInterval)

export default async function handler(req, res) {
  if (initialized) {
    if (Object.keys(cache).length === 0) {
      res.status(503).json({ error: 'Service Unavailable: Cache is empty.' });
      return
    }

    const { ids } = req.query
    const idsArray = ids.split(',')
    const filteredData = idsArray.reduce((result, id) => {
      if (cache && Object.prototype.hasOwnProperty.call(cache, id)) {
        result[id] = cache[id]
      }
      return result
    }, {})

    if (Object.keys(filteredData).length === 0) {
      res.status(404).json({ error: 'No data found for the provided IDs.' })
      return
    }
    res.status(200).json(filteredData)
  } else {
    res.status(503).json({ error: 'Cache is not initialized yet.' })
  }
}
