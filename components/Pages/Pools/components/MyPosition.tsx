import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, HStack, Tooltip, VStack, Text } from '@chakra-ui/react'
import React from 'react'
import { formatPrice, fromChainAmount } from 'libs/num'

type Props = {
    myPositiionAmount: string | number
    lpToken: string | number
}



const MyPosition = ({
    myPositiionAmount,
    lpToken
}: Props) => {

    return (
        <HStack justifyContent="end">
            <Text align="right">{myPositiionAmount !== 'NA' ? `$${formatPrice(myPositiionAmount)}` : myPositiionAmount}</Text>
            <Tooltip label={<VStack>
                <Text>lpTokens: {fromChainAmount(lpToken, 1)}</Text>
            </VStack>} padding="20px" borderRadius="20px" bg="blackAlpha.900" fontSize="xs" maxW="330px">
                <Box cursor="pointer" color="brand.50">
                    <InfoOutlineIcon width=".9rem" height=".9rem" />
                </Box>
            </Tooltip>
        </HStack>
    )
}

export default MyPosition