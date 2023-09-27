import React from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { useQueryClient } from 'react-query'

import { HStack, Image, ListIcon, ListItem, Text } from '@chakra-ui/react'

function ChainItem({
  chain,
  index,
  onChange,
  onClose,
  chainList,
  active,
  walletNotConnected,
}) {
  const queryClient = useQueryClient()
  return (
    <ListItem
      justifyContent="space-between"
      display="flex"
      alignItems="center"
      borderBottom={
        index === chainList.length - 1
          ? 'unset'
          : '1px solid rgba(255, 255, 255, 0.1)'
      }
      paddingY={1}
      opacity={active ? 1 : 0.3}
      cursor={walletNotConnected ? 'default' : "pointer"}
      _hover={!walletNotConnected ? {
        opacity: 1,
      } : null}
      onClick={() => {
        if (!walletNotConnected) {
          onChange(chain)
          queryClient.clear()
          onClose()
        } else {
          null
        }
      }}
    >
      <HStack>
        <Image src={chain?.icon} alt="" boxSize={30} objectFit="cover" />
        <Text paddingLeft={3}>{chain?.label}</Text>
      </HStack>
      <ListIcon
        as={BsCircleFill}
        color= {walletNotConnected ? '#cc0000' : '#3CCD64'}
        boxShadow={walletNotConnected ? "0px 0px 14.0801px #9f0000": "0px 0px 14.0801px #298F46"}
        bg="#1C1C1C"
        borderRadius="full"
      />
    </ListItem>
  )
}

export default ChainItem
