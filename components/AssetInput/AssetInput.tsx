import { Input, forwardRef, Button, HStack, Image, Text, IconButton, Divider, Show } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import AssetSelectModal from './AssetSelectModal';
import { FC } from 'react'
// import { Asset } from 'types/blockchain'
import { useTokenInfo } from 'hooks/useTokenInfo'
import FallbackImage from 'components/FallbackImage'

interface AssetInputProps {
    token: any;
    value: any;
    onChange: (value: any) => void;
    showList?: boolean;
    onInputFocus?: () => void;
    balance?: number;
    disabled?: boolean;
}



const AssetInput: FC<AssetInputProps> = forwardRef(({ token, balance, onChange, value, showList = true, disabled }, ref) => {

    const tokenInfo = useTokenInfo(token?.tokenSymbol)

    return (
        <HStack
            width="full"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="30px"
            paddingLeft={6}
            paddingRight={3}

        >
            <HStack flex={1}>
                <Input
                    ref={ref}
                    type="number"
                    value={value?.amount || ""}
                    variant="unstyled"
                    color="brand.500"
                    placeholder='0.00'
                    disabled={disabled}
                    // onFocus={onInputFocus}
                    onChange={({ target }) => onChange({ ...token, amount: target.value })}
                />
                <Show above='sm'>
                    <Button disabled={disabled} variant="outline" size="xs" onClick={() => onChange({ ...token, amount: balance / 2 })}>half</Button>
                    <Button disabled={disabled} variant="outline" size="xs" onClick={() => onChange({ ...token, amount: balance })}>max</Button>
                </Show>
            </HStack>
            <Divider orientation='vertical' h="50px" />
            {
                showList ? (
                    <AssetSelectModal onChange={onChange} currentToken={tokenInfo?.symbol} disabled={disabled}>
                        {tokenInfo?.symbol ? (
                            <>
                                <Image
                                    style={{ margin: 'unset' }}
                                    maxH={{ base: 6, md: 8 }}
                                    src={tokenInfo?.logoURI} alt="logo-small"
                                    boxSize="2.5rem"
                                    fallback={<FallbackImage />} />)
                                <Text size="lg" fontWeight="400">{tokenInfo?.symbol || 'Select Token'}</Text>
                            </>) :
                            <Text 
                                paddingLeft="10px"
                                size="lg" 
                                fontWeight="400" 
                                color="brand.200">
                                    {tokenInfo?.symbol || 'Select Token'}
                                </Text>
                        }

                        <IconButton
                            disabled={disabled}
                            margin="unset"
                            variant="unstyled"
                            color="white"
                            aria-label='go back'
                            icon={<ChevronDownIcon />}
                            style={{ margin: 'unset' }}
                        />
                    </AssetSelectModal>

                ) : (
                    <HStack
                        justifyContent="end"
                        width="fit-content"
                        paddingRight={2}
                    >
                        <Image src={tokenInfo?.logoURI} alt="logo-small" boxSize="2.5rem" fallback={<FallbackImage />} />
                        <Text fontSize="20" fontWeight="400">{tokenInfo?.symbol}</Text>
                    </HStack>
                )
            }

        </HStack>
    )
})

export default AssetInput