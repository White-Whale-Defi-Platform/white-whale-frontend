import {Box, HStack, Text, VStack} from '@chakra-ui/react'
import { WhaleTokenType} from './BondingActions'
import {WhaleTooltip} from '../Bonding/BondingOverview'
import { useEffect, useState} from 'react'
import {useRecoilState} from "recoil";
import {bondingState, BondingStatus} from "../../../state/atoms/bondingAtoms";
import {walletState, WalletStatusType} from "../../../state/atoms/walletAtoms";


const Withdraw  = () => {


  const [currentBondingState, setCurrentBondingState] = useRecoilState(bondingState)
  const [currentWalletState, _] = useRecoilState(walletState)

  const isWalletConnected = currentWalletState.status === WalletStatusType.connected

  const [formattedDurationString, setDurationString] = useState<string>(null)

  const startTime = new Date("2023-03-04T17:51").getTime();
  const currentTime = new Date().getTime()
  const duration = (currentTime - startTime) / 1000;

  const setDuration = () => {
    if (duration >= 86400) {
      setDurationString(`${Math.floor(duration / 86400)} days`);
    } else if (duration >= 3600) {
      setDurationString(`${Math.floor(duration / 3600)} hours`);
    } else if (duration >= 60) {
      setDurationString(`${Math.floor(duration / 60)} minutes`);
    } else {
      setDurationString(`${Math.floor(duration)} seconds`);
    }
  }

  useEffect(() => {
    setDuration()
  }, [])

  const [bondedAmpWhale, setBondedAmpWhale] = useState<number>(null)
  const [bondedBWhale, setBondedBWhale] = useState<number>(null)
  const [unbondingAmpWhale, setUnbondingAmpWhale] = useState<number>(null)
  const [unbondingBWhale, setUnbondingBWhale] = useState<number>(null)
  const [withdrawableAmpWhale, setWithdrawableAmpWhale] = useState<number>(null)
  const [withdrawableBWhale, setWithdrawableBWhale] = useState<number>(null)

  useEffect(() => {
    async function fetchLSDInfo() {
      setBondedAmpWhale(345)
      setBondedBWhale(1345)
      setUnbondingAmpWhale(234)
      setUnbondingBWhale(4234)
      setWithdrawableAmpWhale(4637)
      setWithdrawableBWhale(8383)
    }

    if (currentBondingState.status === BondingStatus.uninitialized && isWalletConnected) {
      fetchLSDInfo()
      setCurrentBondingState({
        status: BondingStatus.available,
        edgeTokenList: ["ampWHALE", "bWHALE"],
        bondedAmpWhale: bondedAmpWhale,
        bondedBWhale: bondedBWhale,
        unbondingAmpWhale: unbondingAmpWhale,
        unbondingBWhale: unbondingBWhale,
        withdrawableAmpWhale: withdrawableAmpWhale,
        withdrawableBWhale: withdrawableBWhale,
      })
    } else {
      setBondedAmpWhale(currentBondingState.bondedAmpWhale)
      setBondedBWhale(currentBondingState.bondedBWhale)
      setUnbondingAmpWhale(currentBondingState.unbondingAmpWhale)
      setUnbondingBWhale(currentBondingState.unbondingBWhale)
      setWithdrawableAmpWhale(currentBondingState.withdrawableAmpWhale)
      setWithdrawableBWhale(currentBondingState.withdrawableBWhale)
    }
  }, [isWalletConnected])

  const ProgressBar = ({percent}) => {
    return (
      <Box
        h="3px"
        minW={450}
        bg="whiteAlpha.400"
        borderRadius="10px"
        overflow="hidden">
        <Box
          h="100%"
          bg="#7CFB7D"
          w={`${percent}%`}
          borderRadius="10px"/>
      </Box>
    );
  }

  const TokenBox = ({label, ampWhale, bWhale}) => {
    return <Box
      border="0.5px solid"
      borderColor="whiteAlpha.400"
      borderRadius="10px"
      p={4}
      minW={240}>
      <WhaleTooltip label={label} whale={null} ampWhale={ampWhale} bWhale={bWhale} isWalletConnected={isWalletConnected}
                    tokenType={null}/>
      <Text
        mb="-0.2rem"
        fontSize={23}
        fontWeight="bold">
        {isWalletConnected ? `${(ampWhale + bWhale).toLocaleString()}` : "n/a"}
      </Text>
    </Box>
  }

  const BoxComponent = ({block, whaleTokenType, value, durationString}) => {
    return <VStack justifyContent="center" alignItems="center" mb={30}>
      <HStack justifyContent="space-between" alignItems="flex-start" w="100%" px={4}>
        <Text>
          {value.toLocaleString()} {WhaleTokenType[whaleTokenType]}
        </Text>
        <HStack
          spacing={4}>
          <Text>
            ~ {durationString}
          </Text>
          <Text
            color="grey"
            fontSize={12}>
            block {block.toLocaleString()}
          </Text>
        </HStack>
      </HStack>
      <ProgressBar
        percent={50}/>
    </VStack>
  }
  return <VStack
    spacing={5}
    mb={70}>
    <HStack
      spacing={7}>
      <TokenBox label="Unbonding" ampWhale={currentBondingState.unbondingAmpWhale} bWhale={currentBondingState.unbondingBWhale}/>
      <TokenBox label="Withdrawable" ampWhale={currentBondingState.withdrawableAmpWhale}
                bWhale={currentBondingState.withdrawableBWhale}/>
    </HStack>
    {isWalletConnected && <Box
      overflowY="scroll"
      maxHeight={340}
      minW={510}
      backgroundColor="black"
      padding="4"
      borderRadius="10px"
      mt={10}>
      {[0, 1, 0, 1, 0, 1, 1, 0, 1].map(type => {
        return <BoxComponent
          block={13563224}
          whaleTokenType={type}
          value={3532}
          durationString={formattedDurationString}/>
      })}
    </Box>}
  </VStack>
}

export default Withdraw
