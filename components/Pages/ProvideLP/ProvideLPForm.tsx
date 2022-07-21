import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { FC } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Asset } from 'types/blockchain';


type Props = {
    tokens : Asset[];
    onSubmit: (data:any) => void;
    onInputChange: (asset:Asset, index: number) => void;
}

const ProvideLPForm: FC<Props> = ({tokens, onSubmit, onInputChange}) => {
    const { control, handleSubmit, formState } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokens?.[0],
            token2: tokens?.[1],
            //   slippage: String(DEFAULT_SLIPPAGE),
        },
    });


    return (
        <VStack padding={10}
                    width="full"
                    background="#1C1C1C"
                    boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
                    borderRadius="30px"
                    alignItems="flex-start"
                    minH={400}
                    maxWidth={600}
                    gap={4}
                    as="form"
                    onSubmit={handleSubmit(onSubmit)}

                >

                    <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                        <HStack>
                            <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                            <Text fontSize="14" fontWeight="700">5.54</Text>
                        </HStack>
                        <Controller
                            name="token1"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AssetInput {...field} token={tokens?.[0]} onChange={(value) => { onInputChange(value, 0); field.onChange(value) }} />
                            )}
                        />
                    </VStack>

                    <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                        <HStack>
                            <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                            <Text fontSize="14" fontWeight="700">5.54</Text>
                        </HStack>
                        <Controller
                            name="token2"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AssetInput {...field} token={tokens?.[1]} onChange={(value) => { onInputChange(value, 1); field.onChange(value) }} />
                            )}
                        />
                    </VStack>

                    <Button
                        type='submit'
                        width="full"
                        variant="primary"
                        disabled={!formState?.isValid}
                    >
                        Add Liquidity
                    </Button>

                </VStack>
    )
}

export default ProvideLPForm