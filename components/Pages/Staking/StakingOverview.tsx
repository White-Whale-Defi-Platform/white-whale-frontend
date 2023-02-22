import { useEffect, useState } from 'react'

import { Box, Button, Divider, HStack, Text, useDisclosure, VStack, } from '@chakra-ui/react'

import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'

import { useWallet } from '@terra-money/wallet-provider'

import { Cell, Pie, PieChart } from 'recharts'

import { useRecoilState } from 'recoil'

import WalletModal from '../../../components/Wallet/Modal/Modal'
import Loader from '../../Loader'
import Wallet from '../../Wallet/Wallet'

enum TokenType {
    staked, liquid, pending, claimable
}

const StakingOverview = () => {
    const { disconnect } = useWallet()
    const [{ key, chainId, network, status }, setWalletState] = useRecoilState(walletState)
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
    const [isLoadingStakedTokens, setLoadingStakedTokens] = useState<boolean>(true)
    const [isLoadingLiquidTokens, setLoadingLiquidTokens] = useState<boolean>(true)
    const [isLoadingPendingTokens, setLoadingPendingTokens] = useState<boolean>(true)
    const [isLoadingClaimableTokens, setLoadingClaimableTokens] = useState<boolean>(true)

    const [stakedTokens, setStakedTokens] = useState(null);
    const [liquidTokens, setLiquidTokens] = useState(null);
    const [pendingTokens, setPendingTokens] = useState(null);
    const [claimableTokens, setClaimableTokens] = useState(null);

    const data = [
        { tokenType: TokenType.staked, value: null, color: "#7CFB7D", label: "My staked tokens" },
        { tokenType: TokenType.liquid, value: null, color: "#244228", label: "Liquid tokens" },
        { tokenType: TokenType.pending, value: null, color: "#3273F6", label: "Pending tokens" },
        { tokenType: TokenType.claimable, value: null, color: "#173E84", label: "Claimable tokens" },
    ];

    const [updatedData, setData] = useState(null)

    const setDataValue = (tokenType: TokenType, value: number) => {
        data.find(e => e.tokenType == tokenType).value = value
    }

    const fetchStakedTokens = async function () {
        const value = 500000 // replace with result from get req
        setStakedTokens(value);
        setLoadingStakedTokens(false);
        setDataValue(TokenType.staked, value)
    }
    const fetchLiquidTokens = async function () {
        const value = 345623 // replace with result from get req
        setLiquidTokens(value);
        setLoadingLiquidTokens(false);
        setDataValue(TokenType.liquid, value)
    }

    const fetchPendingTokens = async function () {
        const value = 175122 // replace with result from get req
        setPendingTokens(value);
        setLoadingPendingTokens(false);
        setDataValue(TokenType.pending, value)
    }

    const fetchClaimableTokens = async function () {
        const value = 123456 // replace with result from get req
        setClaimableTokens(value);
        setLoadingClaimableTokens(false);
        setDataValue(TokenType.claimable, value)
    }

    useEffect(() => {
        setTimeout(async () => {
            fetchStakedTokens();
            fetchLiquidTokens();
            fetchPendingTokens();
            fetchClaimableTokens();
        }, 3000)
        setData(data)
    }, []);

    const isLoading = isLoadingStakedTokens || isLoadingLiquidTokens || isLoadingPendingTokens || isLoadingClaimableTokens

    const borderRadius = "30px"

    const TokenBox = ({ tokenType, value, paddingBottom }) => {
        const { color, label } = data.find(e => e.tokenType == tokenType)
        return (
            <Box paddingBottom={paddingBottom}>
                <HStack>
                    <Box
                        bg={color}
                        w="4"
                        h="4"
                        borderRadius="50%" >
                    </Box>
                    <Text
                        opacity="0.5"
                        mb="2">
                        {label}
                    </Text>
                </HStack>
                <HStack>
                    <Text
                        marginLeft={6}
                        marginBottom={1.4}
                        marginRight={-1}>
                        {value}
                    </Text>
                    <Text
                        fontSize="11">
                        $WHALE
                    </Text>
                </HStack>
            </Box>
        );
    };
    return <VStack
        width="full"
        background="#1C1C1C"
        borderRadius={borderRadius}
        alignItems="flex-start"
        verticalAlign="center"
        minH={340}
        minW={600}
        gap={4}
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
            <><VStack
                paddingTop={5}>
                <HStack
                    alignItems="flex-start"
                    paddingLeft={5}>
                    <PieChart
                        width={200}
                        height={200}>
                        <Pie
                            data={updatedData}
                            cx="50%"
                            cy="40%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="none">
                            {data.map((_entry: any, index: number) => (<Cell
                                key={"cell-${index}"}
                                fill={data[index].color} />
                            ))}
                        </Pie>
                    </PieChart>
                    <VStack
                        minW={150}
                        minH={150}
                        alignItems="flex-start"
                        justifyContent="center">
                        <TokenBox
                            tokenType={TokenType.staked}
                            value={stakedTokens.toLocaleString()}
                            paddingBottom={5} />
                        <TokenBox
                            tokenType={TokenType.pending}
                            value={pendingTokens.toLocaleString()}
                            paddingBottom={0} />
                    </VStack>
                    <VStack
                        minW={150}
                        minH={150}
                        alignItems="flex-start"
                        justifyContent="center"
                        paddingLeft={5}>
                        <TokenBox
                            tokenType={TokenType.liquid}
                            value={liquidTokens.toLocaleString()}
                            paddingBottom={5} />
                        <TokenBox
                            tokenType={TokenType.claimable}
                            value={claimableTokens.toLocaleString()}
                            paddingBottom={0} />
                    </VStack>
                </HStack>
            </VStack>
                <VStack
                    width="full"
                    alignItems="flex-start">
                    <Divider
                        opacity="0.2"
                        marginTop={-5} />
                    <HStack
                        paddingLeft={12}
                        paddingTop={3}>
                        {isWalletConnected ?
                            <Button
                                bg="#6ACA70"
                                borderRadius="full"
                                mr="4"
                                width="100%"
                                color="white"
                                minWidth={320}>
                                Stake
                            </Button> :
                            <HStack
                                mr="4">
                                <Wallet
                                    connected={Boolean(key?.name)}
                                    walletName={key?.name}
                                    onDisconnect={resetWalletConnection}
                                    disconnect={disconnect}
                                    isOpenModal={isOpenModal}
                                    onOpenModal={onOpenModal}
                                    onCloseModal={onCloseModal}
                                    isPrimaryButton={true}
                                    primaryButtonMinW={320} />
                                <WalletModal
                                    isOpenModal={isOpenModal}
                                    onCloseModal={onCloseModal}
                                    chainId={chainId} />
                            </HStack>}
                        <Button
                            variant="outline"
                            color="white"
                            borderRadius="full"
                            opacity="0.5"
                            minWidth={150}
                            disabled={!isWalletConnected}
                        >
                            Claim
                        </Button>
                    </HStack>
                </VStack></>}
    </VStack>
}
export default StakingOverview

