export default async function handler(req, res) {
  const { ids } = req.query
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
  const data = await response.json()
  res.status(200).json(data)
}
