import {ArrowBackIcon} from "@chakra-ui/icons"
import {HStack, IconButton, VStack, Text, Button, Box, useDisclosure} from "@chakra-ui/react"
import {useRecoilState} from "recoil"
import {useChains} from "../../../hooks/useChainInfo"
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms"
import Wallet from "../../Wallet/Wallet"
import {ActionType} from "../Bonding/BondingOverview"
import Bond from "./Bond"
import Unbond from "./Unbond"
import Withdraw from "./Withdraw"
import {useRouter} from 'next/router'

import {useWallet} from '@terra-money/wallet-provider'

import WalletModal from '../../Wallet/Modal/Modal'

export enum WhaleTokenType {
  ampWHALE, bWHALE
}

const BondingActions= ({globalAction}) => {

  const [{key, chainId, status, network}, setWalletState] = useRecoilState(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()
  const {
    isOpen: isOpenModal,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure()
  const {disconnect} = useWallet()
  const router = useRouter()
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

  const BondingActionButton = ({action}) => {

    const actionString = ActionType[action].toString()
    const onClick = async () => {
      await router.push(`/${currentChainName}/bonding/${actionString}`)
    }

    return <Button
      sx={{
        "&:hover": {
          backgroundColor: "#1C1C1C",
          color: "#6ACA70",
        },
      }}
      color={globalAction === action ? "white" : "grey"}
      bg={"#1C1C1C"}
      fontSize={20}
      px={5}
      transform="translate(0%, -55%)"
      style={{textTransform: "capitalize"}}
      onClick={onClick}>
      {actionString}
    </Button>
  }

  return (
    <VStack
      width={{base: '100%', md: '650px'}}
      alignItems="flex-start"
      top={200}
      gap={4}
      position="absolute">
      <HStack
        justifyContent="space-between"
        width="full"
        paddingY={5}>
        <IconButton
          variant="unstyled"
          color="white"
          fontSize="28px"
          aria-label="go back"
          icon={<ArrowBackIcon/>}
          onClick={() => router.push(`/${currentChainName}/bonding`)}
        />
        <Text
          as="h2"
          fontSize="24"
          fontWeight="900"
          style={{textTransform: "capitalize"}}>
          {ActionType[globalAction]}
        </Text>
      </HStack>
      <VStack
        width="full"
        background={"#1C1C1C"}
        borderRadius={"30px"}
        alignItems="flex-start"
        verticalAlign="flex-start"
        top={70}
        maxH={660}
        gap={4}
        as="form"
        position="absolute"
        pb={7}
        left="50%"
        transform="translateX(-50%)"
        display="flex">
        <Box
          border="0.5px solid grey"
          borderRadius="30px"
          minH={160}
          minW={570}
          alignSelf="center"
          mt={"50px"}>
          <HStack
            spacing={0}
            justify="center">
            <BondingActionButton action={ActionType.bond}/>
            <BondingActionButton action={ActionType.unbond}/>
            <BondingActionButton action={ActionType.withdraw}/>
          </HStack>
          {(() => {
            switch (globalAction) {
              case ActionType.bond:
                return <Bond/>;
              case ActionType.unbond:
                return <Unbond />;
              case ActionType.withdraw:
                return <Withdraw />;
            }
          })()}
        </Box>
        {isWalletConnected ? <Button
          alignSelf="center"
          bg="#6ACA70"
          borderRadius="full"
          width="100%"
          color="white"
          maxWidth={570}
          style={{textTransform: "capitalize"}}>
          {ActionType[globalAction]}
        </Button> :
          <HStack alignSelf="center">
          <Wallet
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onDisconnect={resetWalletConnection}
            disconnect={disconnect}
            isOpenModal={isOpenModal}
            onOpenModal={onOpenModal}
            onCloseModal={onCloseModal}
            isPrimaryButton={true}
            primaryButtonMinW={570}/>
          <WalletModal
            isOpenModal={isOpenModal}
            onCloseModal={onCloseModal}
            chainId={chainId}/>
        </HStack>}
      </VStack>
    </VStack>)
}

export default BondingActions
