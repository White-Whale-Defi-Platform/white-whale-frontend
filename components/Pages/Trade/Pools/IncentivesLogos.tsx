import { Box, HStack, Image, Text } from '@chakra-ui/react'

export const IncentivesLogos = ({ logos, more }) => (
  <>
    {logos && logos.length > 0 && (
      <HStack
        spacing={1}
        borderBottom="1px dotted rgba(255, 255, 255, 0.5)"
        pb="2"
        h="30px"
        position="relative"
      >
        {logos.map((logo:string, i:number) => (
          <Box
            key={`${logo}-${i}`}
            boxShadow="lg"
            borderRadius="full"
            position="absolute"
            left={`${i * 10}px`}
          >
            <Image
              src={logo}
              width="auto"
              style={{
                margin: 'unset',
                borderRadius: '50%',
              }}
              maxW="1.6rem"
              maxH="1.6rem"
              alt={`token-img-${i}`}
            />
          </Box>
        ))}
        {more > 0 && (
          <Text fontSize="sm" position="relative" zIndex="1">
            + {more}
          </Text>
        )}
      </HStack>
    )}
  </>
);
