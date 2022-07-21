import { HStack, Text, VStack , IconButton} from '@chakra-ui/react';
import Page from 'components/Page';
import { useState, FC } from 'react';
import { Asset } from 'types/blockchain';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter, NextRouter } from "next/router";
import ProvideLPForm from './ProvideLPForm';

export const tokens = [
    {
        asset: "JUNOX",
        icon: "/juno.svg",
        contract: "3fdss1234",
        amount: '',
        balance: 50
    },
    {
        asset: "JUNOONE",
        icon: "/junoone.svg",
        contract: "adfa12342242",
        amount: '',
        balance: 40
    }
]

const ProvideLP: FC = () => {
    const router: NextRouter = useRouter()
    const [lpTokens, setLpTokens] = useState<Asset[]>(tokens)
    const onInputChange = (value: Asset, index: number) => {
        const newState: any = { ...lpTokens }
        newState[index] = { ...lpTokens[index], ...value }
        setLpTokens(newState)
        console.log({ newState })
    }

    const onSubmit = (data) => console.log(data)

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
                    <Text as="h2" fontSize="24" fontWeight="900">Provide Liquidity</Text>
                </HStack>

                <ProvideLPForm
                    tokens={lpTokens}
                    onSubmit={onSubmit}
                    onInputChange={onInputChange}

                />
            </VStack>
        </Page>
    )
}

export default ProvideLP