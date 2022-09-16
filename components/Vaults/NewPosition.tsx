
import { HStack, Text, VStack, IconButton, Box, Tab, Tabs, TabList, TabPanel, TabPanels } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter, NextRouter } from "next/router";
import DepositForm from './ManagePoistion/DepositForm';
import useVault, { useVaultDepost } from './hooks/useVaults'
import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { useTokenBalance } from 'hooks/useTokenBalance'

const NewPosition = () => {
    const router: NextRouter = useRouter()
    const { vaults, isLoading } = useVault()
    const params = new URLSearchParams(location.search)
    const { chainId, key, address } = useRecoilValue(walletState)
    const vaultId = params.get('vault') || 'JUNOX'

    const vault = useMemo(() => vaults?.vaults.find(v => v.vault_assets?.symbol === vaultId), [vaults, vaultId])
    const edgeTokenList = useMemo(() => vaults?.vaults.map(({ vault_assets }) => vault_assets?.symbol), [vaults])

    const { balance: lpTokenBalance, isLoading: lpTokenBalanceLoading } = useVaultDepost(vault?.lp_token)
    const { balance: tokenBalance, isLoading: tokenBalanceLoading } = useTokenBalance(vault?.vault_assets?.symbol)

    return (
        <VStack width={{ base: '100%', md: '700px' }} alignItems="center" padding={5} margin="auto">
            <HStack justifyContent="space-between" width="full" paddingY={5} paddingX={{ base: 4 }} >
                <IconButton
                    variant="unstyled"
                    color="#7A7A7A"
                    fontSize="28px"
                    aria-label='go back'
                    icon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                />
                <Text as="h2" fontSize="24" fontWeight="900">New Positiion</Text>
            </HStack>

            <Box
                background="#1C1C1C"
                padding={[6, 12]}
                paddingTop={[10]}
                borderRadius="30px"
                width={["full"]}
            >


                <Box
                    // border="2px"
                    // borderColor="whiteAlpha.200"
                    // borderRadius="3xl"
                    pt="8"
                    maxW="600px"
                    maxH="fit-content"
                >
                    {
                        vault?.vault_assets?.symbol && (
                            <DepositForm
                                vaultAddress={vault?.vault_address}
                                connected={Boolean(key?.name)}
                                isLoading={tokenBalanceLoading}
                                balance={tokenBalance}
                                defaultToken={vault?.vault_assets?.symbol}
                                edgeTokenList={edgeTokenList}
                                showList={true}
                            />
                        )
                    }

                </Box>

            </Box>

        </VStack>
    )
}

export default NewPosition