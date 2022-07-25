import { Button, HStack, Text, VStack } from '@chakra-ui/react';
// import AssetInput from 'components/AssetInput';
import { FC } from 'react';
import { /**Controller,**/ useForm } from "react-hook-form";
import { Asset } from 'types/blockchain';


type Props = {
    tokens : any[];
    onSubmit: (data:any) => void;
    onInputChange: (asset:Asset, index: number) => void;
}

const ManageLPForm: FC<Props> = ({tokens = [], onSubmit, onInputChange}) => {

    const [tokenA, tokenB] = tokens
    
    const { control, handleSubmit, formState } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
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
                        {/* Type error: Type instantiation is excessively deep and possibly infinite.

                        46 |                             <Text fontSize="14" fontWeight="700">5.54</Text>
                        47 |                         </HStack>
                        > 48 |                         <Controller
                            |                         ^
                        49 |                             name="token1"
                        50 |                             control={control}
                        51 |                             rules={{ required: true }}
                        error Command failed with exit code 1. */}
                        
                        <Controller
                            name="token1"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AssetInput {...field} 
                                    token={tokenA} 
                                    showList={false}
                                    onChange={(value) => { onInputChange(value, 0);  field.onChange(value) }} 
                                    disabled={false}
                                    />
                            )}
                        />
                    </VStack>

                    <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                        <HStack>
                            <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                            <Text fontSize="14" fontWeight="700">5.54</Text>
                        </HStack>

                        {/* Type error: Type instantiation is excessively deep and possibly infinite.

                        77 |                             <Text fontSize="14" fontWeight="700">5.54</Text>
                        78 |                         </HStack>
                        > 79 |                         <Controller
                            |                         ^
                        80 |                             name="token2"
                        81 |                             control={control}
                        82 |                             rules={{ required: true }}
                        error Command failed with exit code 1. */}
                        <Controller
                            name="token2"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AssetInput {...field} 
                                    token={tokenB} 
                                    showList={false}
                                    onChange={(value) => { onInputChange(value, 1); 
                                    field.onChange(value) }}
                                    disabled={false} />
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

export default ManageLPForm