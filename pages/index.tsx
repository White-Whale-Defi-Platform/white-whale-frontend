import { useRouter } from 'next/router'
import { useEffect } from 'react'


const index = () => {
  const router = useRouter()

  useEffect(() => {
    console.log("index page")
    router.replace('/swap')
  }, [])

  return <div></div>
}

export default index