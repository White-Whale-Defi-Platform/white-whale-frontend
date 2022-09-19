import React from 'react'
import {
    HStack,
    Image,
    ListIcon,
    ListItem,
    Text
  } from '@chakra-ui/react'
import { useQueryClient } from 'react-query'
import { BsCircleFill } from 'react-icons/bs'

function ChainItem({chain, index, onChange, onClose, chainList}) {

  const queryClient = useQueryClient()
  return (
    <ListItem
      justifyContent="space-between"
      display="flex"
      alignItems="center"
      borderBottom={index === chainList.length - 1 ? 'unset' : "1px solid rgba(255, 255, 255, 0.1)"}
      paddingY={1}
      opacity={chain.active ? 1 : 0.3}
      cursor="pointer"
      _hover={{
          opacity: 1
      }}
      onClick={() => {
          onChange(chain);
          queryClient.invalidateQueries(['multipleTokenBalances', 'tokenBalance'])
          onClose()
      }}
    >
      <HStack>
          <Image src={chain?.icon} boxSize={30} objectFit='cover' />
          <Text paddingLeft={3} >{chain?.label}</Text>
      </HStack>
      <ListIcon as={BsCircleFill} color='#3CCD64' boxShadow="0px 0px 14.0801px #298F46" bg="#1C1C1C" borderRadius="full" />
  </ListItem>
  )
}

export default ChainItem
