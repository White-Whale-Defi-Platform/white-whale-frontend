import React from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { useQueryClient } from 'react-query'

import { Box, HStack, Image, ListIcon, ListItem, Text, Tooltip } from '@chakra-ui/react'
import { kBg } from 'constants/visualComponentConstants'

const ChainItem = ({
  chain,
  onChange,
  onClose,
  active,
  walletConnected,
  walletType,
}) => {
  const queryClient = useQueryClient()
  return (
    <Tooltip
      label={ !walletConnected && !chain.chainName?.includes('Injective') ? (
        <Box
          maxWidth="220px"
          minWidth="fit-content"
          borderRadius="10px"
          bg="black"
          color="white"
          fontSize={14}
          p={4}
          whiteSpace="pre-wrap"
        >
        To access this chain, you must add it to your wallet.
        </Box>) : !walletConnected && chain.chainName?.includes('Injective') && walletType !== 'station-extension' ? (
        <Box
          maxWidth="220px"
          minWidth="fit-content"
          borderRadius="10px"
          bg="black"
          color="white"
          fontSize={14}
          p={4}
          whiteSpace="pre-wrap"
        >
        Injective with Station not supported. Please try Keplr or Leap.
        </Box>) : null
      }
      bg="transparent"
      hasArrow={false}
      placement="bottom"
      closeOnClick={false}
      arrowSize={0}
    >
      <ListItem
        justifyContent="space-between"
        bg={'#444444'}
        display="flex"
        px={3}
        borderRadius={10}
        alignItems="center"
        paddingY={1}
        opacity={active ? 1 : 0.3}
        cursor={walletConnected ? 'pointer' : 'default'}
        _hover={walletConnected ? {
          opacity: 1,
        } : null}
        onClick={() => {
          if (walletConnected) {
            onChange(chain)
            queryClient.clear()
            onClose()
          }
        }}
      >
        <HStack>
          <Image src={chain?.icon} alt="" boxSize={30} objectFit="cover" />
          <Text paddingLeft={3}>{chain?.label}</Text>
        </HStack>
        <ListIcon
          as={BsCircleFill}
          color= {walletConnected ? '#3CCD64' : '#cc0000'}
          boxShadow={walletConnected ? '0px 0px 14.0801px #298F46' : '0px 0px 14.0801px #9f0000'}
          bg={kBg}
          borderRadius="full"
        />
      </ListItem>
    </Tooltip>
  )
}

export default ChainItem
