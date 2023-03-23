import {ArrowBackIcon} from "@chakra-ui/icons"
import {Box, Button, HStack, IconButton, Text, useDisclosure, VStack} from "@chakra-ui/react"
import {useRecoilState} from "recoil"
import {useChains} from "../../../hooks/useChainInfo"
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms"
import {ActionType} from "../Bonding/BondingOverview"
import Bond from "./Bond"
import Unbond from "./Unbond"
import Withdraw from "./Withdraw"
import {useRouter} from 'next/router'

import {TokenItemState} from "../../../types";
import {bondingAtom} from "./bondAtoms";
import {useBondTokens} from "./hooks/useBondTokens";
import {useWithdrawTokens} from "./hooks/useWithdrawTokens";
import {useUnbondTokens} from "./hooks/useUnbondTokens";
import {convertDenomToMicroDenom} from "../../../util/conversion";
import {TransactionStatus, transactionStatusState} from "../../../state/atoms/transactionAtoms";
import {setTimeout} from "@wry/context";
import { useMemo} from "react";

export enum WhaleTokenType {
  ampWHALE, bWHALE
}

const BondingActions = ({globalAction}) => {

  const [{chainId, status, address, client},_] = useRecoilState(walletState)
  const [transActionStatus, setTransactionStatus] = useRecoilState(transactionStatusState)
  const isWalletConnected: boolean = status === WalletStatusType.connected
  const chains: Array<any> = useChains()
  const currentChain = chains.find((row: { chainId: string }) => row.chainId === chainId)
  const currentChainName = currentChain?.label.toLowerCase()

  const {
    onOpen: onOpenModal,
  } = useDisclosure()
  const router = useRouter()
  const bondTokens = useBondTokens(client, address);
  const unbondTokens = useUnbondTokens(client, address);
  const withdrawTokens = useWithdrawTokens(client, address);


  const onClick = (tokenItemState: TokenItemState) => {
    const adjustedAmount = convertDenomToMicroDenom(tokenItemState.amount, 6)
    const denom = "uwhale"
    console.log("AMOUNT: " + adjustedAmount)
    setTransactionStatus(TransactionStatus.EXECUTING)
    if (globalAction == ActionType.bond) {
      bondTokens(denom, adjustedAmount).then((value: TransactionStatus) => {
        setTransactionStatus(value)
        setTimeout(() => {
          setTransactionStatus(TransactionStatus.IDLE)
        }, 1000)
      })
    } else if (globalAction == ActionType.unbond) {
      unbondTokens(denom, adjustedAmount).then((value: TransactionStatus) => {
        setTransactionStatus(value)
        setTimeout(() => {
          setTransactionStatus(TransactionStatus.IDLE)
        }, 1000)
      })
    } else if (globalAction == ActionType.withdraw) {
      withdrawTokens(denom).then((value: TransactionStatus) => {
        setTransactionStatus(value)
        setTimeout(() => {
          setTransactionStatus(TransactionStatus.IDLE)
        }, 1000)
      })
    }
  }
  const [currentBondState, setCurrentBondState] = useRecoilState<TokenItemState>(bondingAtom)


  const BondingActionButton = ({action}) => {

    const actionString = ActionType[action].toString()
    const onClick = async () => {
      setCurrentBondState({...currentBondState, amount:0})
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
  const buttonLabel = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    else if (currentBondState?.amount === 0 && globalAction !== ActionType.withdraw) return 'Enter Amount'
    else return ActionType[globalAction]
  }, [isWalletConnected, currentBondState, globalAction])
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
                return <Unbond/>;
              case ActionType.withdraw:
                return <Withdraw/>;
            }
          })()}
        </Box>
        <Button
          alignSelf="center"
          bg="#6ACA70"
          borderRadius="full"
          width="100%"
          variant="primary"
          disabled={transActionStatus === TransactionStatus.EXECUTING || (currentBondState.amount <= 0 && globalAction !== ActionType.withdraw)}
          maxWidth={570}
          isLoading={transActionStatus === TransactionStatus.EXECUTING}
          onClick={() => {
            if (isWalletConnected) {
              onClick(currentBondState)
            } else {
              onOpenModal()
            }
          }}
          style={{textTransform: "capitalize"}}>
          {buttonLabel}
        </Button>
      </VStack>
    </VStack>)
}

export default BondingActions
