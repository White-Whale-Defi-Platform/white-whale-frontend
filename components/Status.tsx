import React, { useMemo } from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { useQuery } from 'react-query'

import { HStack, Icon, Text } from '@chakra-ui/react'
import { kBg } from 'constants/visualComponentConstants'
import { useChainInfos } from 'hooks/useChainInfo'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const Status = () => {
  const chains: Array<any> = useChainInfos()
  const { chainId } = useRecoilValue(chainState)

  const url = useMemo(() => chains?.find((c) => c?.chainId === chainId)?.rpc,
    [chainId, chains])
  const { data: status } = useQuery(
    ['status', chainId],
    async () => {
      const res = await fetch(`${url}/status?`)
      const resJons = await res?.json()
      return {
        block: resJons?.result?.sync_info?.latest_block_height || status?.block || resJons.sync_info.latest_block_height,
        active: Boolean(resJons?.result?.sync_info?.latest_block_height) || !resJons.sync_info.catching_up,
      }
    },
    {
      refetchInterval: 6000,
      enabled: Boolean(url),
    },
  )

  return (
    <HStack
      borderRadius="23px"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      width="fit-content"
      /*
       * Right="15px"
       * bottom="10px"
       */
      color="white"
      paddingX={5}
      paddingY={1}
    >
      <Text color="#7A7A7A">Latest synced block</Text>
      <Text color="white">{status?.block}</Text>
      <Icon
        as={BsCircleFill}
        color={status?.active ? '#3CCD64' : 'gray'}
        boxShadow="0px 0px 14.0801px #298F46"
        bg={kBg}
        borderRadius="full"
        width="11px"
        height="11px"
      />
    </HStack>
  )
}

export default Status
