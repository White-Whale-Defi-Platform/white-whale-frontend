import {
  Box,
  HStack,
  Wrap,
  WrapItem,
  Text,
  VStack,
  Button,
  Fade,
  Flex,
} from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import PoolName from './components/PoolName'
import Loader from '../../Loader'
import Volume from './components/Volume'
import Apr from './components/Apr'
import { formatPrice } from 'libs/num'

type Props = {
  pools: any[]
  show: boolean
  isLoading: boolean
}

type ItemProps = {
  label: string
  value: string
  noBorder?: boolean
  children?: ReactNode
}

const Item = ({
  label,
  value,
  noBorder = false,
  children = null,
}: ItemProps) => {
  console.log({ children })
  return (
    <HStack
      py="10px"
      width="full"
      borderBottom={noBorder ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'}
      justifyContent="space-between"
    >
      <Text color="gray">{label} </Text>
      {children ? children : <Text>{value}</Text>}
    </HStack>
  )
}

const NewTable = ({ pools, show, isLoading }: Props) => {
  if (!show) return null

  if (isLoading) {
    return (
      <Flex
        padding={10}
        width={['full', '1160px']}
        background="#1C1C1C"
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="30px"
        justifyContent="center"
      >
        <Loader />
      </Flex>
    )
  }

  return (
    <Fade in={true}>
      <Wrap spacing="30px">
        {pools.map((pool) => (
          <WrapItem
            key={pool?.pool}
            as={VStack}
            background="#212121"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            maxW="350px"
            minW="350px"
          >
            <Box
              p="25px"
              width="full"
              borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            >
              <PoolName
                poolId={pool?.pool}
                token1Img={pool?.token1Img}
                token2Img={pool?.token2Img}
              />
            </Box>

            <VStack px="50px" width="full">
              <Item label="Price" value={pool?.price} />
              <Item
                label="APR"
                value={pool?.apr}
                children={
                  pool?.isSubqueryNetwork && (
                    <Apr pairAddr={pool.contract} tvl={pool.totalLiq} />
                  )
                }
              />
              <Item
                label="Total Liquidity"
                value={`$${formatPrice(pool?.totalLiq)}`}
              />
              <Item
                label="24h volume"
                value={pool?.volume24hr}
                noBorder={true}
                children={
                  pool?.isSubqueryNetwork && <Volume pairAddr={pool.contract} />
                }
              />

              <HStack
                py="10px"
                width="full"
                justifyContent="space-between"
                bg="rgba(255, 255, 255, 0.05);"
                p="16px"
                borderRadius="10px"
              >
                <Text color="gray">My Position</Text>
                <Text>${pool?.myPosition}</Text>
              </HStack>

              <HStack py="30px" gap={4}>
                <Button
                  variant="outline"
                  size="sm"
                  width="full"
                  onClick={pool?.cta}
                >
                  Manage Liquidty
                </Button>
                {/* <Button variant="outline" size="sm" width="full">
                                    Incentivies
                                </Button> */}
              </HStack>
            </VStack>
          </WrapItem>
        ))}
      </Wrap>
    </Fade>
  )
}

export default NewTable
