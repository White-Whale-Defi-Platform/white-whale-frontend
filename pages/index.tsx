import { useEffect } from 'react'

import { useRouter } from 'next/router'

const index = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/swap')
  }, [])

  return <div></div>
}

export default index
