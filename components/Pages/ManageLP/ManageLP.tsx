import { HStack, Text, VStack, IconButton } from '@chakra-ui/react';
import Page from 'components/Page';
import { FC, useEffect, useMemo } from 'react';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter, NextRouter } from "next/router";
import ManageLPForm from './ManageLPForm';
import { usePoolFromListQueryById } from 'queries/usePoolsListQuery';
import { tokenLpAtom } from './lpAtoms';
import { useRecoilState } from 'recoil';
import { useBondTokens } from '../../../hooks/useBondTokens';
import { executeAddLiquidity } from '../../../services/liquidity';
// export const tokens = [
//     {
//         asset: "JUNOX",
//         icon: "/juno.svg",
//         contract: "3fdss1234",
//         amount: '',
//         balance: 50
//     },
//     {
//         asset: "JUNOONE",
//         icon: "/junoone.svg",
//         contract: "adfa12342242",
//         amount: '',
//         balance: 40
//     }
// ]

const ManageLP: FC = () => {
    const router: NextRouter = useRouter()
    const params = new URLSearchParams(location.search)

    const poolId = useMemo(() => {
        return params.get('poolId')
    }, [params])

    // const [lpTokens, setLpTokens] = useState(null)
    const [[tokenA, tokenB], setTokenLPState] = useRecoilState(tokenLpAtom)
    // usePoolFromListQueryById returns PoolEntityType which includes the swap addr and lp staking addr
    const [pool] = usePoolFromListQueryById({ poolId })
 

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
        const newState: any = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }
        setTokenLPState(newState)
    }

    

    
    return (
        <Page>
            <VStack width={700} justifyContent="center" className='testing'>
                <HStack justifyContent="space-between" width="full" paddingY={4} >
                    <IconButton
                        variant="unstyled"
                        color="#7A7A7A"
                        fontSize="28px"
                        aria-label='go back'
                        icon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                    // onClick={() => router.push("/pools")}
                    />
                    <Text as="h2" fontSize="24" fontWeight="900">Manage Liquidity</Text>
                </HStack>

                <ManageLPForm
                    tokens={[tokenA, tokenB]}
                    pool={pool}
                    onInputChange={onInputChange}

                />

            </VStack>
        </Page>
    )
}

export default ManageLP