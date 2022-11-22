import { Box, HStack, Text, VStack } from '@chakra-ui/react'

import FlashloanForm from './FlashloanForm'

const Flashloan = () => {
  return (
    <VStack width={{ base: '100%', md: '722px' }} alignItems="center">
      <Box>
        <HStack justifyContent="space-between" width="full" paddingY={10}>
          <Text as="h2" fontSize="24" fontWeight="700">
            Flashloan
          </Text>
        </HStack>
        <FlashloanForm />
      </Box>
    </VStack>
  )
}

export default Flashloan
