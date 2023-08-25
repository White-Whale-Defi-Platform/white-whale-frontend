import { useEffect } from 'react'

import { NextRouter, useRouter } from 'next/router'

const Index = () => {
  const router: NextRouter = useRouter()

  /*
   * UseEffect(() => {
   *   router.replace('/migaloo/swap')
   *   // eslint-disable-next-line react-hooks/exhaustive-deps
   * }, [])
   */

  return <div></div>
}

export default Index
