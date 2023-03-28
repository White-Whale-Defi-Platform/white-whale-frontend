import { HStack, VStack, Text, Image, Button } from "@chakra-ui/react"
import { TooltipWithChildren } from "components/TooltipWithChildren"

type Props = {}

const Claim = (props: Props) => {
  return (
    <VStack>

      <HStack
        justifyContent="space-between"
        width="full"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="15px"
        p={4}
        pt={3.5}
        style={{ marginBottom: 30 }}
      >
        <TooltipWithChildren
          label="Available Rewards"
          isHeading
          fontSize="16"
        >
          <Text fontSize="16px">Available Rewards</Text>
        </TooltipWithChildren>

        <TooltipWithChildren
          label="$3,111"
          fontSize="16"
        >
          <Text fontSize="16px">$3,111</Text>
        </TooltipWithChildren>
      </HStack>


      <VStack
        width="full"
        background="#151515"
        boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
        borderRadius="15px"
        maxH="250px"
        overflowY="scroll"
        sx={{
          '&::-webkit-scrollbar': {
            width: '.4rem',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.8)',
          },
        }}
        px="5"
        py="4"
      >

        {
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
            <HStack
              key={item}
              width="full"
              justifyContent="space-between"
              borderBottom="1px solid rgba(255, 255, 255, 0.1)"
              py={2}
            >

              <HStack
                gap={[1]}
                p={2}
              >
                <Image
                  width="auto"
                  minW="1.5rem"
                  maxW="1.5rem"
                  maxH="1.5rem"
                  style={{ margin: 'unset' }}
                  src="/logos/axlUSDC.png"
                  alt="logo-small"
                // fallback={<FallbackImage />}
                />
                <Text fontSize="16px" fontWeight="400">
                  USDC
                </Text>
              </HStack>

              <VStack >
                <Text >6534</Text>
                <Text color="brand.50" style={{ margin: 'unset' }}>=$34</Text>
              </VStack>

            </HStack>
          ))
        }



      </VStack>

      <Button
        style={{ marginTop: 30 }}
        type="submit"
        width="full"
        variant="primary"
      >
        Claim
      </Button>

    </VStack>
  )
}

export default Claim