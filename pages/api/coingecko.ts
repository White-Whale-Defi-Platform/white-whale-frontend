let cache = {}
const fetchInterval = 60 * 1000 // 60 seconds
const coinGeckoIds = ['white-whale', 'chihuahua-token', 'lion-dao', 'terra-luna', 'comdex', 'cosmos', 'injective-protocol', 'juno-network', 'sei-network', 'terra-luna-2']
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
};

// Perform the initial fetch immediately on server start
fetchDataFromCoinGecko().then((data) => {
  cache = data
})

setInterval(async () => {
  await fetchDataFromCoinGecko()
}, fetchInterval)

export default async function handler(req, res) {
  const { ids } = req.query
  const idsArray = ids.split(',')
  const filteredData = idsArray.reduce((result, id) => {
    if (cache[id]) {
      result[id] = cache[id];
    }
    return result;
  }, {})
  res.status(200).json(filteredData);
}
