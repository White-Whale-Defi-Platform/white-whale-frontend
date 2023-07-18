import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'

import { Cell, Pie, PieChart } from 'recharts'

import Loader from '../../Loader'
import { useRouter } from 'next/router'
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

export enum WhaleType {
  ampWHALE,
  bWHALE,
  WHALE,
}

const BondingOverview = ({
  isWalletConnected,
  isLoading,
  data,
  whalePrice,
  currentChainName,
  mobile
}) => {
  const borderRadius = '30px'
  const router = useRouter()
  const TokenBox = ({ tokenType }) => {
    const { color, label } = data.find((e) => e.tokenType == tokenType)
    const box = ()=>{
      if (!mobile){
        return (<Box bg={color} w="4" h="4" borderRadius="50%" mr="2"></Box>)
      }else return
    }
    return (
      <HStack mr="10" paddingBottom={6}>
        {box()}
        <WhaleTooltip
          key={`${tokenType}${color}`}
          label={label}
          data={null}
          isWalletConnected={isWalletConnected}
          tokenType={tokenType}
        />
      </HStack>
    )
  }

  const piechart = ()=>{
    if (mobile){
      return
    }else{
    return(
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
                data?.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={data[index].color} />
                ))
              ) : (
                <Cell key={'cell-${index}'} fill="grey" />
              )}
            </Pie>
          </PieChart>)}
  }

  let aggregatedAssets = data?.reduce((acc, e) => acc + (e?.value ?? 0), 0)

  return (
    <VStack
      width="full"
      background={'#1C1C1C'}
      borderRadius={borderRadius}
      alignItems="flex-start"
      verticalAlign="center"
      as="form"
      overflow="hidden"
      position="relative"
      display="flex"
      justifyContent="center"
    >
      {isLoading ? (
        <HStack
          width="full"
          alignContent="center"
          justifyContent="center"
          alignItems="center"
        >
          <Loader />
        </HStack>
      ) : (
        <HStack
          alignItems="center"
          justifyContent="flex-start"
          pl={4}
          pt={5}
          spacing={"5"}
        >
          {piechart()}
          <VStack alignItems="start" alignSelf="flex-start">
            <Text paddingBottom={4} color="whiteAlpha.600">
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
            <Text marginBottom={-2} paddingEnd={10} color="whiteAlpha.600">
              {`Value($${(aggregatedAssets * Number(whalePrice)).toFixed(2)})`}
            </Text>
            {/*value equals the amount of the specific token type (liquid, bonded, unbonding, withdrawable)*/}
            {data?.map(
              (e: {
                value: number | string
                actionType: ActionType
                tokenType: TokenType
              }) => {
                return (
                  <WhaleTooltip
                    key={`${e.tokenType}${e.actionType}`}
                    label={
                      e?.value !== null && isWalletConnected
                        ? `$${(Number(e.value) * Number(whalePrice)).toFixed(
                            2
                          )}`
                        : 'n/a'
                    }
                    tokenType={e.tokenType}
                    data={data}
                    isWalletConnected={isWalletConnected}
                  />
                )
              }
            )}
          </VStack>
          <VStack
            alignItems="flex-start"
            justify="flex-start"
            alignSelf="flex-start"
            paddingRight={5}
            spacing={8}
          >
            <Text mb={-2} color="whiteAlpha.600">
              Actions
            </Text>
            {data?.map((e: { actionType: ActionType }) => (
              <Button
                key={`button-${e.actionType}`}
                alignSelf="flex-start"
                variant="outline"
                size="sm"
                w={110}
                style={{ textTransform: 'capitalize' }}
                onClick={async () => {
                  if (e.actionType === ActionType.buy) {
                    await router.push(`/${currentChainName}/swap`)
                  } else {
                    await router.push(
                      `/${currentChainName}/dashboard/${
                        ActionType[e.actionType]
                      }`
                    )
                  }
                }}
              >
                {ActionType[e.actionType]}
              </Button>
            ))}
          </VStack>
        </HStack>
      )}
    </VStack>
  )
}
export default BondingOverview
