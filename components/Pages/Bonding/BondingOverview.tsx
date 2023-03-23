import {Box, Button, Divider, HStack, Text, Tooltip as ChakraTooltip, VStack,} from '@chakra-ui/react'

import {Cell, Pie, PieChart} from 'recharts'

import Loader from '../../Loader'
import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from "react";
import {BondingData} from "./types/BondingData";

interface WhaleTooltipProps {
  data: BondingData[];
  withdrawableAmpWhale?: number;
  withdrawableBWhale?: number;
  label: string;
  isWalletConnected: boolean;
  tokenType: TokenType;
}

export enum TokenType {
  bonded, liquid, unbonding, withdrawable
}

export enum ActionType {
  buy, bond, unbond, withdraw
}

export enum WhaleType {
  ampWHALE, bWHALE, WHALE
}

export const WhaleTooltip = ({
                               data, label, isWalletConnected, tokenType,
                               withdrawableAmpWhale, withdrawableBWhale
}: WhaleTooltipProps) => {
  const { whale = null, ampWhale = null, bWhale = null} = data?.find(e => e.tokenType == tokenType) || {}

  const lsdTokenDetails = [{
    type: WhaleType.bWHALE,
    value:withdrawableBWhale ?? bWhale}, {
    type: WhaleType.ampWHALE,
    value:withdrawableAmpWhale ?? ampWhale
  }].sort((a, b) => b.value - a.value);

  const TokenDetail = ({whaleType, value}) => {
    return <HStack
      justify="space-between"
      direction="row"
      width="full"
      px={2}>
      <Text
        color="whiteAlpha.600"
        fontSize={14}>
        {WhaleType[whaleType]}
      </Text>
      <Text
        fontSize={14}>
        {isWalletConnected ? value : "n/a"}
      </Text>
    </HStack>
  }
  const textRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    setTextWidth(textRef.current.offsetWidth);
  }, [whale, ampWhale, bWhale]);

  return <ChakraTooltip
    sx={{boxShadow: "none"}}
    label={
      <VStack
        minW="250px"
        minH="90px"
        borderRadius="10px"
        bg="blackAlpha.900"
        px="4"
        py="4"
        position="relative"
        border="none"
        justifyContent="center"
        alignItems="center">
        {ampWhale === null && withdrawableAmpWhale == null ?
          <Text>
            {tokenType === TokenType.liquid ? "Liquid Tokens" :
              tokenType === TokenType.bonded ? "Current amount of bonded LSD Whale token":
                tokenType === TokenType.unbonding ? "Current amount of unbonding LSD Whale token" :
                  tokenType === TokenType.withdrawable ? "Current amount of withdrawable LSD Whale token": null}
          </Text> :
          <>{tokenType === TokenType.liquid ?
            <> <TokenDetail
              whaleType={WhaleType.WHALE}
              value={whale}/>
              <Divider
                width="93%"
                borderWidth="0.1px"
                color="whiteAlpha.300"/>
            </> : null
          }
            {lsdTokenDetails.map((e, index) => {
              return <>
                <TokenDetail
                  whaleType={e.type}
                  value={e.value}/>
                {index === 0 && <Divider width="93%" borderWidth="0.1px" color="whiteAlpha.300"/>}
              </>
            })
            }
          </>
        }
      </VStack>}
    bg="transparent">
    <VStack alignItems="flex-start" minW={100}>
      <Text
        ref={textRef}
        mb="-0.3rem"
        color="white">
        {label}
      </Text>
      <Box pb={1}>
        {label !== "n/a" && <div
          style={{
            width: `${textWidth}px`,
            height: '1px',
            background: `repeating-linear-gradient(
            to right,
            white,
            white 1px,
            transparent 1px,
            transparent 5px
          )`,
          }}
        />}
      </Box>
    </VStack>
  </ChakraTooltip>
}

const BondingOverview = ({
                           isWalletConnected,
                           isLoading,
                           data,
                           currentChainName,
                         }) => {

  const borderRadius = "30px"
  const router = useRouter()
  const TokenBox = ({tokenType}) => {
    const {color, label} = data.find(e => e.tokenType == tokenType)

    return (
      <HStack
        mr="10"
        paddingBottom={6}>
        <Box
          bg={color}
          w="4"
          h="4"
          borderRadius="50%"
          mr="2">
        </Box>
        <WhaleTooltip label={label} data={null}
                      isWalletConnected={isWalletConnected}
                      tokenType={tokenType}/>
      </HStack>
    );
  };
  return <VStack
    width="full"
    background={"#1C1C1C"}
    borderRadius={borderRadius}
    alignItems="flex-start"
    verticalAlign="center"
    minH={320}
    minW={840}
    as="form"
    overflow="hidden"
    position="relative"
    display="flex"
    justifyContent="center">
    {isLoading && data ?
      <HStack
        minW={100}
        minH={100}
        width="full"
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
        <Loader/>
      </HStack> :
      <HStack
        alignItems="center"
        justifyContent="flex-start"
        pl={8}
        pt={5}
        spacing={12}>
        <PieChart
          style={{pointerEvents: 'none'}}
          width={250}
          height={275}>
          <Pie
            data={isWalletConnected ? data : [{value: 1}]}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={110}
            dataKey="value"
            stroke="none">
            {isWalletConnected ?
              data?.map((_entry: any, index: number) => (<Cell
                  key={`cell-${index}`}
                  fill={data[index].color}

                />
              )) :
              <Cell
                key={"cell-${index}"}
                fill="grey"/>}
          </Pie>
        </PieChart>
        <VStack
          alignItems="start"
          alignSelf="flex-start">
          <Text
            paddingBottom={4}
            color="whiteAlpha.600">
            Tokens
          </Text>
          {data?.map(e =>
            (<TokenBox tokenType={e.tokenType}/>)
          )}
        </VStack>
        <VStack
          alignItems="start"
          spacing={8}
          alignSelf="flex-start">
          <Text
            marginBottom={-2}
            paddingEnd={10}
            color="whiteAlpha.600">
            Amount
          </Text>
          {data?.map((e: { value: number | string, actionType: ActionType, tokenType: TokenType }) => {
              return <WhaleTooltip label={e?.value !== null && isWalletConnected ? e.value.toLocaleString() : "n/a"}
                                   tokenType={e.tokenType} data={data} isWalletConnected={isWalletConnected}/>
            }
          )}
        </VStack>
        <VStack alignItems="flex-start" justify="flex-start" alignSelf="flex-start" spacing={8}>
          <Text
            mb={-2}
            color="whiteAlpha.600">
            Actions
          </Text>
          {data?.map((e: { actionType: ActionType }) =>
            <Button
              alignSelf="flex-start"
              variant="outline"
              size="sm"
              minW={110}
              style={{textTransform: "capitalize"}}
              onClick={async () => {
                if (e.actionType === ActionType.buy) {
                  await router.push(`/${currentChainName}/swap`)
                } else {
                  await router.push(`/${currentChainName}/bonding/${ActionType[e.actionType]}`)
                }
              }}>
              {ActionType[e.actionType]}
            </Button>)}
        </VStack>
      </HStack>}
  </VStack>
}
export default BondingOverview

