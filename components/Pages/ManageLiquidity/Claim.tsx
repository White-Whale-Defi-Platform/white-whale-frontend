import { HStack, VStack, Text, Image, Button } from "@chakra-ui/react"
import { TooltipWithChildren } from "components/TooltipWithChildren"
import { useTokenList } from "hooks/useTokenList"
import { useMemo, useState } from "react"
import { useClaim } from "./hooks/useClaim"
import ClaimTable from "./ClaimTable"
import SubmitButton from 'components/SubmitButton'
import { TxStep } from "types/common"
import { num } from "libs/num"
import { useQuery } from "react-query"


const AvailableRewards = ({ totalValue }) => (
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
      showTooltip={false}
    />

    <TooltipWithChildren
      label={`$${totalValue}`}
      fontSize="16"
      showTooltip={false}
    />
  </HStack>
)

type Props = {
  poolId: string
}


const rewardsMock = [{
  "amount": "10090909000563",
  "info": {
    "token": {
      "contract_addr": "migaloo1j08452mqwadp8xu25kn9rleyl2gufgfjnv0sn8dvynynakkjukcq5u780c"
    }
  },
},
{
  "amount": "152339933",
  "info": {
    "native_token": {
      "denom": "uwhale"
    }
  }
}]

const useRewards = () => {
  return useQuery({
    queryKey: 'rewards',
    queryFn: async () => {
      return rewardsMock
    }
  })
}


const Claim = ({ poolId }: Props) => {
  const [tokenList] = useTokenList()

  const claim = useClaim({ poolId })
  const [totalValue, setTotalValue] = useState(0)
  const { data: rewards = [] } = useRewards()

  const tokens = useMemo(() => {

    return rewards.map((reward) => {
      if (reward.info.token) {
        const t = tokenList?.tokens.find((token) => token.denom === reward.info.token.contract_addr)
        return { ...t, amount: num(reward.amount).div(10 ** t?.decimals).toFixed(6) }
      }
      if (reward.info.native_token) {
        const t = tokenList?.tokens.find((token) => token.denom === reward.info.native_token.denom)
        return { ...t, amount: num(reward.amount).div(10 ** t?.decimals).toFixed(6) }
      }
      return false
    }).filter(Boolean)


  }, [rewards, tokenList])

  return (
    <VStack>

      <AvailableRewards totalValue={totalValue} />

      <ClaimTable tokens={tokens} setTotalValue={setTotalValue} />

      <SubmitButton
        label="Claim"
        isConnected={true}
        txStep={TxStep.Ready}
        isDisabled={rewards.length === 0}
        isLoading={claim.isLoading}
        onClick={() => claim.submit()}
      />

    </VStack>
  )
}

export default Claim