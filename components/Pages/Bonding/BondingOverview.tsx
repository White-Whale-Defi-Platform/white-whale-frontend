import { useEffect, useState } from 'react'

import { Box, Button, Divider, HStack,Text, Tooltip, useDisclosure, VStack, } from '@chakra-ui/react'

import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'

import { useWallet } from '@terra-money/wallet-provider'

import { Cell, Pie, PieChart } from 'recharts'

import { useRecoilState } from 'recoil'

import Loader from '../../Loader'
import { BondingData } from './types/BondingData'
import { useChains } from '../../../hooks/useChainInfo'
import { useRouter } from 'next/router'
import { InfoOutlineIcon } from '@chakra-ui/icons'

export enum TokenType {
    bonded, liquid, unbonding, withdrawable
}

export enum ActionType {
    buy, bond, unbond, withdraw
}

export enum WhaleType {
    ampWHALE, bWHALE, WHALE
}

export const WhaleTooltip = ({ WHALE, bWHALE, ampWHALE, isWalletConnected, tokenType }) => {
    const lsdTokenDetails = [{ type: WhaleType.bWHALE, value: bWHALE }, { type: WhaleType.ampWHALE, value: ampWHALE }].sort((a, b) => b.value - a.value);

    const TokenDetail = ({ whaleType, value }) => {
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
    return <Tooltip
        sx={{ boxShadow: "none" }}
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
                {tokenType === TokenType.liquid ?
                  <> <TokenDetail whaleType={WhaleType.WHALE} value={WHALE} />
                    <Divider width="93%" borderWidth="0.1px" color="whiteAlpha.300" /></> :
                  null}
                {lsdTokenDetails.map((e, index) => {
                    return <> <TokenDetail whaleType={e.type} value={e.value} />
                        {index === 0 && <Divider width="93%" borderWidth="0.1px" color="whiteAlpha.300" />}</>
                })}
            </VStack>}
        bg="transparent">
        <Box
            cursor="pointer"
            color="brand.50"
            marginTop="-1px"
            display="flex"
            alignItems="center">
            <InfoOutlineIcon width=".7rem" />
        </Box>
    </Tooltip>
}

const BondingOverview = () => {
    const { disconnect } = useWallet()
    const [{chainId, network, status }, setWalletState] = useRecoilState(walletState)
    const isWalletConnected: boolean = status === WalletStatusType.connected
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure()

    const resetWalletConnection = () => {
        setWalletState({
            status: WalletStatusType.idle,
            address: '',
            key: null,
            client: null,
            network,
            chainId,
            activeWallet: null,
        })
        disconnect()
    }
    const [isLoadingBondedTokens, setLoadingBondedTokens] = useState<boolean>(true)
    const [isLoadingLiquidTokens, setLoadingLiquidTokens] = useState<boolean>(true)
    const [isLoadingTokensToUnbond, setLoadingTokensToUnbond] = useState<boolean>(true)
    const [isLoadingWithdrawableTokens, setLoadingWithdrawableTokens] = useState<boolean>(true)

    const data: BondingData[] = [
        { tokenType: TokenType.liquid, value: null, color: "#244228", label: "Liquid", actionType: ActionType.buy },
        { tokenType: TokenType.bonded, value: null, color: "#7CFB7D", label: "Bonded", actionType: ActionType.bond },
        { tokenType: TokenType.unbonding, value: null, color: "#3273F6", label: "Unbonding", actionType: ActionType.unbond },
        { tokenType: TokenType.withdrawable, value: null, color: "#173E84", label: "Withdrawable", actionType: ActionType.withdraw },
    ];

    const [updatedData, setData] = useState(null)

    const setDataValue = (tokenType: TokenType, value: number) => {
        data.find(e => e.tokenType == tokenType).value = value
    }

    const fetchBondedTokens = async function () {
        const value = isWalletConnected ? 5002340 : null// replace with result from get req
        setLoadingBondedTokens(false);
        setDataValue(TokenType.bonded, value)
    }
    const fetchLiquidTokens = async function () {
        const value = isWalletConnected ? 345623 : null// replace with result from get req
        setLoadingLiquidTokens(false);
        setDataValue(TokenType.liquid, value)
    }

    const fetchTokensToUnbond = async function () {
        const value = isWalletConnected ? 175122 : null // replace with result from get req
        setLoadingTokensToUnbond(false);
        setDataValue(TokenType.unbonding, value)
    }

    const fetchWithdrawableTokens = async function () {
        const value = isWalletConnected ? 123456 : null// replace with result from get req
        setLoadingWithdrawableTokens(false);
        setDataValue(TokenType.withdrawable, value)
    }

    useEffect(() => {
        setTimeout(async () => {
            fetchBondedTokens();
            fetchLiquidTokens();
            fetchTokensToUnbond();
            fetchWithdrawableTokens();
            setData(data)
        }, 2000)

    }, [isWalletConnected]);

    const isLoading = isLoadingBondedTokens || isLoadingLiquidTokens || isLoadingTokensToUnbond || isLoadingWithdrawableTokens

    const borderRadius = "30px"
    const chains: Array<any> = useChains()
    const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
    const currentChainName = currentChain?.label.toLowerCase()
    const router = useRouter()

    const TokenBox = ({ tokenType }) => {
        const { color, label } = data.find(e => e.tokenType == tokenType)

        return (
            <HStack
                mr="10"
                paddingBottom={6}>
                <Box
                    bg={color}
                    w="4"
                    h="4"
                    borderRadius="50%"
                    mr="2" >
                </Box>
                <Text
                    opacity="0.5"
                    mb="2">
                    {label}
                </Text>
                <WhaleTooltip WHALE={0} ampWHALE={2345} bWHALE={4567} isWalletConnected={isWalletConnected} tokenType={tokenType}/>
            </HStack>
        );
    };
    //  <Text>{value}</Text>

    return <VStack
        width="full"
        background="#1C1C1C"
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
        {isLoading ?
            <HStack
                minW={100}
                minH={100}
                width="full"
                alignContent="center"
                justifyContent="center"
                alignItems="center"
            >
                <Loader />
            </HStack> :
            <HStack
                alignItems="center"
                paddingLeft={8}
                spacing={12}>
                <PieChart
                    width={250}
                    height={275}>
                    <Pie
                        data={isWalletConnected ? updatedData : [{ value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none">
                        {isWalletConnected ? data.map((_entry: any, index: number) => (<Cell
                            key={`cell-${index}`}
                            fill={data[index].color} />
                        )) :
                            <Cell
                                key={"cell-${index}"}
                                fill="grey" />}
                    </Pie>
                </PieChart>
                <VStack
                    alignItems="start">
                    <Text
                        paddingBottom={6}
                        color="whiteAlpha.600">
                        Tokens
                    </Text>
                    {data.map(e =>
                        (<TokenBox tokenType={e.tokenType} />)
                    )}
                </VStack>
                <VStack
                    alignItems="flex-start">

                    <Text
                        paddingBottom={6}
                        paddingEnd={10}
                        color="whiteAlpha.600">
                        Amount
                    </Text>
                    {updatedData.map((e: { value: number | string, actionType: ActionType }) =>
                        <Text
                            paddingBottom={6}>
                            {e?.value !== null ?
                                e.value.toLocaleString() :
                                "n/a"}
                        </Text>)}
                </VStack>
                <VStack alignItems="flex-start" justify="flex-start" alignSelf="flex-start" spacing={6}>
                    <Text
                        paddingBottom={2}
                        paddingEnd={20}
                        color="whiteAlpha.600">
                        Amount
                    </Text>
                    {updatedData.map((e: { actionType: ActionType }) =>
                        <Button
                            alignSelf="flex-start"
                            variant="outline"
                            size="sm"
                            minW={110}
                            style={{ textTransform: "capitalize" }}
                            onClick={() => {
                                if (e.actionType === ActionType.buy) {
                                    router.push(`/${currentChainName}/swap`)
                                } else {
                                    router.push(`/${currentChainName}/bonding/${ActionType[e.actionType]}`)
                                }
                            }}>
                            {ActionType[e.actionType]}
                        </Button>)}
                </VStack>
            </HStack>}
    </VStack>
}
export default BondingOverview

