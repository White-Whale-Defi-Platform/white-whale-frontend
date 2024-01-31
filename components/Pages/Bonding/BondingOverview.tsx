import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { BondingData } from 'components/Pages/Bonding/types/BondingData'
import { kBg, kBorderRadius } from 'constants/visualComponentConstants'
import { useRouter } from 'next/router'
import { Cell, Pie, PieChart } from 'recharts'

import { WhaleTooltip } from './WhaleTooltip'

export enum TokenType {
  bonded,
  liquid,
  unbonding,
  withdrawable,
}

export enum ActionType {
  buy,
  bond,
  unbond,
  withdraw,
  claim,
  createNewEpoch,
}
type Props = {
  isWalletConnected: boolean
  data: BondingData[]
  whalePrice: number
  currentChainName: string
  mobile: boolean
}

const BondingOverview = ({
  isWalletConnected,
  data,
  whalePrice,
  currentChainName,
  mobile,
}: Props) => {
  const router = useRouter()
  const TokenBox = ({ tokenType }) => {
    const { color, label } = data.find((e) => e.tokenType === tokenType)
    const box = () => {
      if (!mobile) {
        return <Box bg={color} w="4" h="4" borderRadius="50%" mr="2"></Box>
      } else {
        return <></>
      }
    }
    return (
      <HStack mr="10" paddingBottom={6}>
        {box()}
        <WhaleTooltip
          key={`${tokenType}${color}`}
          label={label}
          isWalletConnected={isWalletConnected}
          tokenType={tokenType}
        />
      </HStack>
    )
  }

  const piechart = () => {
    if (mobile) {
      return <></>
    } else {
      return (
        <PieChart style={{ pointerEvents: 'none' }} width={250} height={275}>
          <Pie
            data={isWalletConnected ? data : [{ value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={110}
            dataKey="value"
            stroke="none"
          >
            {isWalletConnected ? (
              data?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={data[index].color} />
              ))
            ) : (
              <Cell fill="grey" />
            )}
          </Pie>
        </PieChart>
      )
    }
  }

  const aggregatedAssets = data?.reduce((acc, e) => acc + (e?.value ?? 0), 0)

  return (
    <VStack
      width="full"
      background={kBg}
      borderRadius={kBorderRadius}
      alignItems="flex-start"
      verticalAlign="center"
      as="form"
      overflow="hidden"
      position="relative"
      display="flex"
      justifyContent="center"
    >
      <HStack
        alignItems="center"
        justifyContent="flex-start"
        paddingLeft={4}
        pt={5}
        spacing={['2', '5']}
      >
        {piechart()}
        <VStack alignItems="start" alignSelf="flex-start">
          <Text paddingBottom={[2, 4]} color="whiteAlpha.600">
              Tokens
          </Text>
          {data?.map((e) => (
            <TokenBox
              key={`tokenBox-${e.actionType}`}
              tokenType={e.tokenType}
            />
          ))}
        </VStack>
        <VStack alignItems="start" spacing={8} alignSelf="flex-start">
          <Text marginBottom={['-3.5', '-2']} paddingEnd={['5', '10']} color="whiteAlpha.600">
            {`Value($${(aggregatedAssets * Number(whalePrice)).toFixed(2)})`}
          </Text>
          {/* Value equals the amount of the specific token type (liquid, bonded, unbonding, withdrawable)*/}
          {data?.map((e: {
                value: number | string
                actionType: ActionType
                tokenType: TokenType
                tokenBalances: TokenBalance[]
              }, index) => (
            <WhaleTooltip
              key={`${e.tokenType}${index}`}
              label={
                e?.value && isWalletConnected
                  ? `$${(Number(e.value) * Number(whalePrice)).toFixed(2)}`
                  : 'n/a'
              }
              tokenType={e.tokenType}
              data={data}
              isWalletConnected={isWalletConnected}
            />
          ))}
        </VStack>
        <VStack
          alignItems="flex-start"
          justify="flex-start"
          alignSelf="flex-start"
          paddingLeft={3}
          paddingRight={6}
          spacing={8}
        >
          <Text mb={-2} color="whiteAlpha.600">
              Actions
          </Text>
          {data?.map((e: { actionType: ActionType }, index) => (e.actionType !== ActionType.buy ? (
            <Button
              key={`button-${index}`}
              alignSelf="flex-start"
              variant="outline"
              borderColor="whiteAlpha.700"
              size="sm"
              w={110}
              style={{ textTransform: 'capitalize' }}
              onClick={async () => {
                if (e.actionType === ActionType.buy) {
                  await router.push(`/${currentChainName}/swap`)
                } else {
                  await router.push(`/${currentChainName}/bonding/${
                    ActionType[e.actionType]
                  }`)
                }
              }}
            >
              {ActionType[e.actionType]}
            </Button>
          ) : <Box key={'buy-placeholder'} height={27}/>))}
        </VStack>
      </HStack>
    </VStack>
  )
}
export default BondingOverview
