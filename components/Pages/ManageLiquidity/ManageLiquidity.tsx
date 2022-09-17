import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, HStack, IconButton, Tab, TabList, TabPanel, TabPanels,Tabs, Text, VStack } from '@chakra-ui/react';
import { TxStep } from 'hooks/useTransaction';
import { NextRouter,useRouter } from "next/router";
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery';
import { FC, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';

import useProvideLP from "../NewPosition/hooks/useProvideLP"
import DepositForm from './DepositForm';
import { tokenLpAtom } from './lpAtoms';
import WithdrawForm from './WithdrawForm';


const ManageLiquidity: FC = () => {
    const router: NextRouter = useRouter()
    const params = new URLSearchParams(location.search)
    const { chainId, key, status } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState(false)
    const [reverse, setReverse] = useState<boolean>(false)
    const [isTokenSet, SetIsToken] = useState<boolean>(false)


    const poolId = useMemo(() => {
        return params.get('poolId')
    }, [params])

    // const [lpTokens, setLpTokens] = useState(null)
    const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
    // usePoolFromListQueryById returns PoolEntityType which includes the swap addr and lp staking addr
    const [pool] = usePoolFromListQueryById({ poolId })

    const { simulated, tx } = useProvideLP({ reverse })


    useEffect(() => {
        if (poolId) {
            const [tokenASymbol, tokenBSymbol] = poolId?.split("-")
            setTokenLPState([
                {
                    tokenSymbol: tokenASymbol,
                    amount: 0,
                },
                {
                    tokenSymbol: tokenBSymbol,
                    amount: 0,
                },
            ])
            SetIsToken(true)
        }
        return () => {
            setTokenLPState([
                {
                    tokenSymbol: null,
                    amount: 0,
                },
                {
                    tokenSymbol: null,
                    amount: 0,
                },
            ])
            SetIsToken(true)
        }
    }, [poolId, setTokenLPState]
    )



    const onInputChange = ({ tokenSymbol, amount }: any, index: number) => {
        if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
            tx.reset()

        const newState: any = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }
        setTokenLPState(newState)
    }


    return (
        <VStack width={{ base: '100%', md: '700px' }} alignItems="center" padding={5} margin="auto">
            <HStack justifyContent="space-between" width="full" paddingY={5} paddingX={{ base: 4 }} >
                <IconButton
                    variant="unstyled"
                    color="white"
                    fontSize="28px"
                    aria-label='go back'
                    icon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                />
                <Text as="h2" fontSize="24" fontWeight="900">Manage Liquidity</Text>
            </HStack>

            <Box
                background="#1C1C1C"
                padding={[6, 12]}
                paddingTop={[10]}
                borderRadius="30px"
                width={["full"]}
            >


                <Box
                    border="2px"
                    borderColor="whiteAlpha.200"
                    borderRadius="3xl"
                    // px="4"
                    // py="8"
                    pt="8"
                    // boxSize="md"
                    maxW="600px"
                    maxH="fit-content"
                >
                    <Tabs variant="brand">
                        <TabList justifyContent="center" background="#1C1C1C">
                            <Tab>Deposit</Tab>
                            <Tab>Withdraw</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel padding={4}>
                                {isTokenSet && (
                                    <DepositForm
                                        setReverse={setReverse}
                                        reverse={reverse}
                                        connected={status}
                                        tokenA={tokenA}
                                        tokenB={tokenB}
                                        onInputChange={onInputChange}
                                        simulated={simulated}
                                        tx={tx}
                                    />
                                )}

                            </TabPanel>
                            <TabPanel padding={4}>
                                <WithdrawForm
                                    connected={status}
                                    tokenA={{
                                        tokenSymbol: poolId,
                                        amount: 0,
                                    }}
                                    poolId={poolId}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>

            </Box>

        </VStack>
    )
}

export default ManageLiquidity
