import { useEffect } from 'react'

import { useRouter } from 'next/router'

const index = () => {
  const router = useRouter()

  useEffect(() => {
    // console.log("index page")
    router.replace('/swap')
  }, [])

  return <div></div>
}

export default index
