
import { Box, HStack, Image, Text } from '@chakra-ui/react'
import FallbackImage from 'components/FallbackImage'

type Props = {
    vaultId: string
    tokenImage: string
}

const VaultName = ({ vaultId, tokenImage }: Props) => (
    <HStack alignItems="center">
        <HStack width="60px">
            <Box
                bg="#252525"
                boxShadow="lg"
                borderRadius="full"
                position="relative"
            >
                <Image
                    src={tokenImage}
                    width="auto"
                    maxW="1.7rem"
                    maxH="1.7rem"
                    fallback={<FallbackImage width="8" height='8' color={["#5DB7DE", "#343434"]} />} />
            </Box>
        </HStack>
        <Text textAlign="center" fontSize={["12px", "16px"]}> {vaultId} </Text>

    </HStack>
)

export default VaultName