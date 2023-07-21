import { Box, HStack, Image, Text } from '@chakra-ui/react'

export const IncentivesLogos = ({ logos, more }) => (
  <HStack
    spacing={1}
    borderBottom="1px dotted rgba(255, 255, 255, 0.5)"
    pb="2"
    h="30px"
  >
    <HStack spacing="0">
      {logos?.map((logo, i) => (
        <Box
          key={`${logo}-${i}`}
          boxShadow="lg"
          borderRadius="full"
          position="absolute"
          pl={i > 0 && '10px'}
          zIndex={i}
        >
          <Image
            src={logo}
            width="auto"
            maxW="1.6rem"
            maxH="1.6rem"
            alt="token1-img"
          />
        </Box>
      ))}
    </HStack>
    {more > 0 && <Text fontSize="sm">+ {more}</Text>}
  </HStack>
)
