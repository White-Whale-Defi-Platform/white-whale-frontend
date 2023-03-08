import React, { useEffect, useMemo } from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { Box, HStack, Icon, Text } from '@chakra-ui/react'
import { useChainInfo, useChains } from 'hooks/useChainInfo'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { nodeError as nodeErrorAtom } from '../state/atoms/nodeError'

const useStatus = ({chainId, url}) => {
  return useQuery(
    ['status', chainId],
    async () => {
      try{
        const res = await fetch(`${url}/status?`)
        const resJons = await res?.json()
        return {
          block: resJons?.result?.sync_info?.latest_block_height,
          active: !!resJons?.result?.sync_info?.latest_block_height,
        }
      }catch(error){
        throw new Error(error)
      }
    },
    {
      refetchInterval: 6000,
      enabled: !!url,
    }
  )
}

const Status = () => {
  const chains = useChains()
  const { chainId } = useRecoilValue(walletState)
  const [nodeError, setNodeError] = useRecoilState(nodeErrorAtom)

  const url = useMemo(() => {
    return chains?.find((c) => c?.chainId === chainId)?.rpc
  }, [chainId, chains])

  const {data: status, error, isLoading} = useStatus({chainId, url})


  useEffect(() => {
    if(!!error)
      setNodeError(true)
    else if(!error && !isLoading)
      setNodeError(false)
    

  },[error, nodeError])

  return (
    <HStack
      borderRadius="23px"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      width="fit-content"
      // right="15px"
      // bottom="10px"
      color="white"
      paddingX={5}
      paddingY={1}
    >
      <Text color="#7A7A7A">Latest synced block</Text>
      <Text color="white">{status?.block}</Text>
      <Icon
        as={BsCircleFill}
        color={!!status?.active ? '#3CCD64' : 'gray'}
        boxShadow="0px 0px 14.0801px #298F46"
        bg="#1C1C1C"
        borderRadius="full"
        width="11px"
        height="11px"
      />
    </HStack>
  )
}

export default Status
