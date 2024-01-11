import axios from 'axios'

const Cors = async (req, res) => {
  const { url } = req.query

  try {
    const config = {
      headers: {
        'x-whitewhale': '5C23Quwy2eLTaCvE',
      },
    }
    const _res = await axios.get(url, config)
    res.status(200).send(_res.data);
  } catch (error) {
    res.status(400).send(error.toString());
  }
}

export default Cors
