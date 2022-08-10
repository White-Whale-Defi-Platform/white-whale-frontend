import { HStack, Text, VStack, IconButton, Box, Tab, Tabs, TabList, TabPanel, TabPanels } from '@chakra-ui/react';
import Page from 'components/Page';
import { FC, useEffect, useMemo, useState } from 'react';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter, NextRouter } from "next/router";
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery';
import { tokenLpAtom } from './lpAtoms';
import { useBondTokens } from '../../../hooks/useBondTokens';
import { executeAddLiquidity } from '../../../services/liquidity';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';
import { useRecoilState, useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import useProvideLP from "../NewPosition/hooks/useProvideLP"
import { TxStep } from 'hooks/useTransaction';


const ManageLiquidity: FC = () => {
    const router: NextRouter = useRouter()
    const params = new URLSearchParams(location.search)
    const { chainId, key } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState(false)
    const [reverse, setReverse] = useState<boolean>(false)


    const poolId = useMemo(() => {
        return params.get('poolId')
    }, [params])

    // const [lpTokens, setLpTokens] = useState(null)
    const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
    // usePoolFromListQueryById returns PoolEntityType which includes the swap addr and lp staking addr
    const [pool] = usePoolFromListQueryById({ poolId })

    const { simulated, tx } = useProvideLP({reverse})


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
            <HStack justifyContent="space-between" width="full" paddingY={5} paddingX={{ base: 4, md: 14 }} >
                <IconButton
                    variant="unstyled"
                    color="#7A7A7A"
                    fontSize="28px"
                    aria-label='go back'
                    icon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                />
                <Text as="h2" fontSize="24" fontWeight="900">Manage Liquidity</Text>
            </HStack>

            <Box
                background="#1C1C1C"
                padding={12}
                borderRadius="30px"
            >


                <Box
                    border="2px"
                    borderColor="whiteAlpha.200"
                    borderRadius="3xl"
                    px="4"
                    py="8"
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
                            <TabPanel>
                                <DepositForm
                                    setReverse={setReverse}
                                    reverse={reverse}
                                    connected={Boolean(key?.name)}
                                    tokenA={tokenA}
                                    tokenB={tokenB}
                                    onInputChange={onInputChange}
                                    simulated={simulated}
                                    tx={tx}
                                />
                            </TabPanel>
                            <TabPanel>
                                <WithdrawForm
                                    connected={Boolean(key?.name)}
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