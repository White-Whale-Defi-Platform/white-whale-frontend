import { useEffect, useState } from 'react'

import { Box, Button, HStack, Image, Text, useDisclosure, VStack } from '@chakra-ui/react'

import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'

import { useWallet } from '@terra-money/wallet-provider'

import { useRecoilState } from 'recoil'
import WalletModal from '../../Wallet/Modal/Modal'
import Wallet from '../../Wallet/Wallet'
import Loader from '../../Loader'

 const ProgressBar = ({ percent }) => {
    const colors = ["#E43A1C", "#EE902E", "#FAFD3C", "#7CFB7D"]
    return (
        <Box
            h="7px"
            minW={390}
            bg="whiteAlpha.400"
            borderRadius="10px"
            overflow="hidden"
        >
            <Box h="100%" bg={colors[Math.trunc(percent / 25)]} w={`${percent}%`} borderRadius="10px" />
        </Box>
    );
}

const RewardsComponent = ({isHorizontalLayout}) => {

    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure()

    const [isLoadingRewards, setLoadingRewards] = useState<boolean>(true)
    const [{ key, chainId, network, status }, setWalletState] = useRecoilState(walletState)
    const { disconnect } = useWallet()

    const isWalletConnected: boolean = status === WalletStatusType.connected

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
    const [price, setPrice] = useState(null);

    const [isLoadingWhalePrice, setLoadingWhalePrice] = useState<boolean>(true)

    const fetchPrice = async function () {
        const value = 12.53// replace with result from get req
        setPrice(value);
        setLoadingWhalePrice(false);
    }

    const [myRewards, setMyRewards] = useState<number>(null);

    const fetchMyRewards = async function () {
        const value = 0// replace with result from get req
        setMyRewards(value);
        setLoadingRewards(false);
    }
    useEffect(() => {
        setTimeout(async () => {
            fetchPrice();
            fetchMyRewards();

        }, 2000)
    }, [isWalletConnected]);
    const isLoading = isLoadingRewards || isLoadingWhalePrice

    // TODO global constant?
    const boxBg = "#1C1C1C"
    // TODO global constant ?
    const borderRadius = "30px"

    const hours = (new Date()).getHours()

    return (<>{isLoading ?
        <VStack
            width="full"
            background={boxBg}
            borderRadius={borderRadius}
            minH={320}
            minW={450}
            gap={4}
            overflow="hidden"
            position="relative"
            display="flex"
            justifyContent="center"
        >
            <HStack
                minW={100}
                minH={100}
                width="full"
                alignContent="center"
                justifyContent="center"
                alignItems="center"
            >
                <Loader />
            </HStack>
        </VStack> :
        <VStack
            width="full"
            background={boxBg}
            borderRadius={borderRadius}
            alignItems="center"
            minH={320}
            w={450}
            gap={4}
            overflow="hidden"
            position="relative"
            display="flex"
            justifyContent="flex-start"
            alignSelf={isHorizontalLayout ? "none":"center"}
        >
            <HStack
            justifyContent="space-between"
            align="stretch"
            mt={7}
            minW={390}>
                <HStack flex="1">
                    <a>
                        <Image src="/img/logo.svg" alt="WhiteWhale Logo" boxSize={[5, 7]} />
                    </a>
                    <Text fontSize={20}>WHALE</Text>
                </HStack>
                <Text color="#7CFB7D" fontSize={18}>${price}</Text>
            </HStack>
            <VStack
            >
                <HStack
                    justifyContent="space-between"
                    minW={390}>
                    <Text color="whiteAlpha.600">Next rewards in</Text>
                    <Text>{24 - hours} hours</Text>
                </HStack>
                <ProgressBar percent={(hours / 24) * 100} />
            </VStack>
            <Box
                border="0.5px solid"
                borderColor="whiteAlpha.400"
                borderRadius="10px"
                p={4}
                minW={390}>
                <HStack
                    justifyContent="space-between">
                    <Text
                        color="whiteAlpha.600">
                        Rewards
                    </Text>
                    <Text>
                        {isWalletConnected ? `${myRewards.toLocaleString()} WHALE `: "n/a"}
                    </Text>
                </HStack>
                <HStack>
                    <Text
                        color="whiteAlpha.600"
                        fontSize={11}>
                        Estimated APR
                    </Text>
                    <Text
                        fontSize={11}>
                          {isWalletConnected ? "0.23 %": "n/a"}
                    </Text>
                </HStack>
                <HStack>
                    <Text
                        color="whiteAlpha.600"
                        fontSize={11}>
                        Multiplier
                    </Text>
                    <Text
                        fontSize={11}>
                          {isWalletConnected ? "10 %": "n/a"}
                    </Text>
                </HStack>
            </Box>
            {isWalletConnected ?
                <Button
                    bg="#6ACA70"
                    borderRadius="full"
                    mr="4"
                    minW={390}
                    disabled={myRewards === 0}
                    color="white">
                    Claim
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
                        primaryButtonMinW={390} />
                    <WalletModal
                        isOpenModal={isOpenModal}
                        onCloseModal={onCloseModal}
                        chainId={chainId} />
                </HStack>}
        </VStack>}</>)
}

export default RewardsComponent
