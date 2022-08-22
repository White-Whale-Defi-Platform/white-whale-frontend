import { useRouter } from 'next/router'
import { useEffect } from 'react'


const index = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/swap')
  }, [])

  return null
}

export default index