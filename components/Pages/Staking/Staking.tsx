import { FC, useEffect, useState } from 'react'

import { Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react'

import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'

import { useRecoilValue } from 'recoil'

import Loader from '../../Loader'
import StakingOverview from './StakingOverview'

const Staking: FC = () => {
  const { status } = useRecoilValue(walletState)
  const isWalletConnected: boolean = status === WalletStatusType.connected

  const [isLoadingWhalePrice, setLoadingWhalePrice] = useState<boolean>(true)
  const [isLoadingStaked, setLoadingStaked] = useState<boolean>(true)
  const [isLoadingRewards, setLoadingRewards] = useState<boolean>(true)

  const [price, setPrice] = useState(null);
  const [totalStaked, setTotalStaked] = useState(null);
  const [myRewards, setMyRewards] = useState(null);
  const [claimableRewards, setClaimable] = useState(null);

  const fetchPrice = async function () {
    const value = 12.53// replace with result from get req
    setPrice(value);
    setLoadingWhalePrice(false);
  }

  const fetchTotalStaked = async function () {
    const value = 125372845// replace with result from get req
    setTotalStaked(value);
    setLoadingStaked(false);
  }

  const fetchMyRewards = async function () {
    const value = 7512// replace with result from get req
    setMyRewards(value);
    setLoadingRewards(false);
  }

  const fetchClaimableRewards = async function () {
    const value = 3822// replace with result from get req
    setClaimable(value);
    setLoadingRewards(false);
  }

  useEffect(() => {
    setTimeout(async () => {
      fetchPrice();
      fetchTotalStaked();
      fetchMyRewards();
      fetchClaimableRewards();
    }, 3000)
  }, []);

  const gap = 4
  // TODO global constant?
  const boxBg = "#1C1C1C"
  // TODO global constant ?
  const borderRadius = "30px"

  const RewardsStack = ({ label, value }) =>
    <VStack
      paddingLeft={8}
      alignItems="flex-start"
      justifyContent="center">
      <Text 
      opacity="0.5" 
      marginBottom="-5px">
        {label}
      </Text>
      <HStack
        verticalAlign="flex-end">
        <Text
          fontSize="28"
          fontWeight="900"
          marginBottom="8px">
          {value}
        </Text>
        <Text
          fontSize="16">
          $WHALE
        </Text>
      </HStack>
    </VStack>

  return (
    <VStack
      align="flex-start"
      alignItems="flex-start"
      justifyContent="center"
    >
      <HStack
        justifyContent="flex-start"
        alignItems="flex-start"
        align="flex-start"
        width="full"
        paddingY={5}
      >
        <Text
          as="h2"
          fontSize="24"
          fontWeight="900">
          Staking
        </Text>
      </HStack>
      <HStack
        align="flex-start"
        gap={gap}>
        <VStack
          gap={gap}>
          <Box
            background={boxBg}
            borderRadius={borderRadius}
            minH={158}
            minW={300}
            display="flex"
            alignItems="center"
            justifyContent="flex-start">
            {isLoadingWhalePrice ?
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
              <VStack
                paddingLeft={8}
                alignItems="flex-start"
                justifyContent="center">
                <Text
                  opacity="0.5"
                  marginBottom="-5px">
                  WHALE price
                </Text>
                <HStack
                  verticalAlign="flex-end">
                  <Text
                    fontSize="16"
                    marginBottom="-10px"
                    marginEnd="-7px">
                    $
                  </Text>
                  <Text
                    fontSize="28"
                    fontWeight="900">
                    {price}
                  </Text>
                </HStack>
              </VStack>}
          </Box>
          <Box
            background={boxBg}
            borderRadius={borderRadius}
            minH={158}
            minW={300}
            display="flex"
            alignItems="center"
            justifyContent="flex-start">
            {isLoadingStaked ?
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
              <VStack
                paddingLeft={8}
                alignItems="flex-start"
                justifyContent="center">
                <Text
                  opacity="0.5"
                  marginBottom="-5px">
                  Total staked
                </Text>
                <HStack
                  verticalAlign="flex-end">
                  <Text
                    fontSize="28"
                    fontWeight="900"
                    marginBottom="8px">
                    {totalStaked.toLocaleString()}
                  </Text>
                  <Text
                    fontSize="16">
                    $WHALE
                  </Text>
                </HStack>
              </VStack>}
          </Box>
        </VStack>
        <StakingOverview />
        {isLoadingRewards ?
          <VStack
            width="full"
            background={boxBg}
            borderRadius={borderRadius}
            alignItems="flex-start"
            minH={340}
            minW={300}
            gap={gap}
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
            alignItems="flex-start"
            minH={340}
            minW={300}
            gap={gap}
            overflow="hidden"
            position="relative"
            display="flex"
            justifyContent="center"
          >
            <RewardsStack
              label="My rewards"
              value={myRewards.toLocaleString()} />
            <RewardsStack
              label="Claimable rewards"
              value={claimableRewards.toLocaleString()} />
            <VStack
              width="full"
              paddingTop={5}>
              <Divider 
              opacity="0.2" />
              <HStack 
              paddingTop={3}>
                <Button 
                variant="outline"
                  color="white"
                  borderRadius="full"
                  minW={240}
                  disabled={!isWalletConnected}
                >
                  Claim rewards
                </Button>
              </HStack>
            </VStack>
          </VStack>}
      </HStack>
    </VStack>
  );
}

export default Staking
