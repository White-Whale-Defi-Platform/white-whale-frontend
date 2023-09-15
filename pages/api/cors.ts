import axios from 'axios'

const Cors = async (req, res) => {
  const { url } = req.query

  try {
    const _res = await axios.get(url)
    res.status(200).send(_res.data)
    /*
     * Add a cache of 10 seconds to avoid constantly returning the same data
     * res.setHeader('Cache-Control', 's-maxage=10')
     */
  } catch (error) {
    res.status(400).send(error.toString())
  }
}

export default Cors
