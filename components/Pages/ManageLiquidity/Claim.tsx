import { HStack, VStack, Text, Image, Button } from "@chakra-ui/react"
import { TooltipWithChildren } from "components/TooltipWithChildren"
import { useTokenList } from "hooks/useTokenList"
import { useMemo } from "react"
import { useClaim } from "../NewPosition/hooks/useClaim"

type Props = {
  poolId: string
}


const rewards = [{
  "amount": "1009563",
  "info": {
    "token": {
      "contract_addr": "migaloo1j08452mqwadp8xu25kn9rleyl2gufgfjnv0sn8dvynynakkjukcq5u780c"
    }
  },
},
{
  "amount": "15259735712",
  "info": {
    "native_token": {
      "denom": "uwhale"
    }
  }
}]


const Claim = ({poolId}: Props) => {
  const [tokenList] = useTokenList()

  const claim = useClaim({poolId})

  const tokens = useMemo(() => {

    return rewards.map((reward) => {
      if (reward.info.token) {
        const t = tokenList?.tokens.find((token) => token.denom === reward.info.token.contract_addr)
        return {...t, amount: reward.amount}
      }
      if (reward.info.native_token) {
        const t= tokenList?.tokens.find((token) => token.denom === reward.info.native_token.denom)
        return {...t, amount: reward.amount}
      }
      return false
    }).filter(Boolean)


  }, [rewards, tokenList])

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
          tokens.map((item, index) => (
            <HStack
              key={item?.denom}
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
                  src={item?.logoURI}
                  alt="logo-small"
                // fallback={<FallbackImage />}
                />
                <Text fontSize="16px" fontWeight="400">
                  {item?.symbol}
                </Text>
              </HStack>

              <VStack alignItems="flex-end" >
                <Text >{item?.amount}</Text>
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
        onClick={() => claim.submit()}
        isDisabled={rewards.length === 0}
        isLoading={claim.isLoading}
      >
        Claim
      </Button>

    </VStack>
  )
}

export default Claim