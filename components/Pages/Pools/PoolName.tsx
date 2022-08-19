
import { Box, HStack, Image, Text } from '@chakra-ui/react'
import FallbackImage from 'components/FallbackImage'

type Props = {
    poolId: string
    token1Img: string
    token2Img: string
}

const PoolName = ({ poolId, token1Img, token2Img }: Props) => (
    <HStack alignItems="center">
        <HStack spacing="-2" width="60px">
            <Box
                bg="#252525"
                boxShadow="lg"
                borderRadius="full"
                position="relative"
            >
                <Image
                    src={token1Img}
                    alt="logo-small" boxSize="2.5rem"
                    fallback={<FallbackImage width="8" height='8' color={["#5DB7DE", "#343434"]} />} />
            </Box>
            <Box borderRadius="full">
                <Image
                    src={token2Img}
                    alt="ust" boxSize="2.5rem"
                    fallback={<FallbackImage width="8" height='8' color={["#FFE66D", "#343434"]} />}
                />

            </Box>
        </HStack>
        <Text textAlign="center" > {poolId} </Text>

    </HStack>
)

export default PoolName