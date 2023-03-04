import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, HStack, Tooltip, VStack, Text } from '@chakra-ui/react'
import React from 'react'
import { formatPrice, fromChainAmount } from 'libs/num'

type Props = {
    pair: string
    myPositiionAmount: string | number
    providedAssets: number[]
}



const MyPosition = ({
    pair,
    myPositiionAmount,
    providedAssets,
}: Props) => {

    const [asset1Name, asset2Name] = pair.split('-')
    const [asset1Amount, asset2Amount] = providedAssets || []

    return (
        <HStack justifyContent="end">
            <Text align="right">{myPositiionAmount !== 'NA' ? `$${formatPrice(myPositiionAmount)}` : myPositiionAmount}</Text>
            <Tooltip label={<VStack>
                <Text>{asset1Name}: {fromChainAmount(asset1Amount, 6)}</Text>
                <Text>{asset2Name}: {fromChainAmount(asset2Amount, 6)}</Text>
            </VStack>} padding="20px" borderRadius="20px" bg="blackAlpha.900" fontSize="xs" maxW="330px">
                <Box cursor="pointer" color="brand.50">
                    <InfoOutlineIcon width=".9rem" height=".9rem" />
                </Box>
            </Tooltip>
        </HStack>
    )
}

export default MyPosition