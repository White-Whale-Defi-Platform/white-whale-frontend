import { FC, useEffect, useState } from 'react'

import { Flex, HStack, Text, VStack } from '@chakra-ui/react'

import BondingOverview from './BondingOverview'
import RewardsComponent from './RewardsComponent';

const Bonding: FC = () => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => {
      setIsHorizontalLayout(window.innerWidth >= 1300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <VStack
    alignSelf="center" >
    <Flex
      direction={isHorizontalLayout ? 'row' : 'column'}
      gap={10}
      justifyContent="space-between"
      alignItems="flex-end">
      <VStack>
        <HStack
          width="full"
          paddingY={5}
        >
          <Text
            as="h2"
            fontSize="24"
            fontWeight="900">
            Bonding
          </Text>
        </HStack>
        <BondingOverview />
      </VStack >
      <RewardsComponent isHorizontalLayout={isHorizontalLayout} />
    </Flex>
  </VStack>
}
export default Bonding
