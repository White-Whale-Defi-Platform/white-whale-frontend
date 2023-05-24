import { ArrowBackIcon } from '@chakra-ui/icons'
import {
    Box,
    HStack,
    IconButton,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack
} from '@chakra-ui/react'
import { useChains } from 'hooks/useChainInfo'
import { TxStep } from 'types/common'
import { NextRouter, useRouter } from 'next/router'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { FC, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import Overview from './Overview'
import Create from './Create'


const Incentivize: FC = () => {
    const router: NextRouter = useRouter()
    const chains: Array<any> = useChains()
    const { address, chainId, status } = useRecoilValue(walletState)
    const [reverse, setReverse] = useState<boolean>(false)
    const [isTokenSet, setIsToken] = useState<boolean>(false)
    const { data: poolList } = usePoolsListQuery()
    const [bondingDays, setBondingDays] = useState(0)

    const poolId = router.query.poolId as string
    const chainIdParam = router.query.chainId as string
    const currentChain = chains.find((row) => row.chainId === chainId)

    useEffect(() => {
        if (currentChain) {
            if (poolId) {
                const pools = poolList?.pools
                if (pools && !pools.find((pool: any) => pool.pool_id === poolId)) {
                    router.push(`/${currentChain.label.toLowerCase()}/pools`)
                } else {
                    router.push(
                        `/${currentChain.label.toLowerCase()}/pools/manage_liquidity?poolId=${poolId}`
                    )
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainId, poolId, poolList, address, chains])






    return (
        <VStack
            width={{ base: '100%', md: '800px' }}
            alignItems="center"
            padding={5}
        >
            <HStack
                justifyContent="space-between"
                width="full"
                paddingY={5}
                paddingX={{ base: 4 }}
            >
                <IconButton
                    variant="unstyled"
                    color="white"
                    fontSize="28px"
                    aria-label="go back"
                    icon={<ArrowBackIcon />}
                    onClick={() => router.push(`/${chainIdParam}/pools`)}
                />
                <Text as="h2" fontSize="24" fontWeight="900">
                    Manage Incentives
                </Text>
            </HStack>

            <Box
                background="#1C1C1C"
                padding={[6, 12]}
                paddingTop={[10]}
                borderRadius="30px"
                width={['full']}
            >
                <Box
                    border="2px"
                    borderColor="whiteAlpha.200"
                    borderRadius="3xl"
                    pt="8"
                    maxH="fit-content"
                >
                    <Tabs variant="brand">
                        <TabList justifyContent="center" background="#1C1C1C">
                            <Tab>Overview</Tab>
                            <Tab>Create</Tab>
                        </TabList>
                        <TabPanels p={4}>
                            <TabPanel padding={4}>
                                <Overview />
                            </TabPanel>
                            <TabPanel padding={4}>
                                <Create />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
        </VStack>
    )
}

export default Incentivize
