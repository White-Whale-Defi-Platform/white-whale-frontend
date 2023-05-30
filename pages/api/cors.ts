import axios from 'axios'

const Cors = async (req, res) => {
  const { url } = req.query

  try {
    const _res = await axios.get(url)
    res.status(200).send(_res.data)
  } catch (error) {
    res.status(400).send(error.toString())
  }
}

export default Cors
