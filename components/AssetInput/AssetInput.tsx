import { Input, forwardRef, Button, HStack, Image, Text, IconButton, Divider, Show, Box } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import AssetSelectModal from './AssetSelectModal';
import { FC } from 'react'
// import { Asset } from 'types/blockchain'
import { useTokenInfo } from 'hooks/useTokenInfo'
import FallbackImage from 'components/FallbackImage'

interface AssetInputProps {
    image?: boolean;
    token: any;
    value: any;
    onChange: (value: any) => void;
    showList?: boolean;
    onInputFocus?: () => void;
    balance?: number;
    disabled?: boolean;
    minMax?: boolean
    isSingleInput?: boolean;
}



const AssetInput: FC<AssetInputProps> = forwardRef(({
    image = true,
    token,
    balance,
    onChange,
    value,
    showList = true,
    disabled,
    minMax = true,
    isSingleInput = false

},
    ref) => {

    const tokenInfo = useTokenInfo(token?.tokenSymbol)

    return (
        <HStack width="full" spacing={0}>
            <HStack
                width="full"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderLeftRadius="30px"
                borderRight="unset"
                height={12}
                paddingLeft={6}
                paddingRight={3}
            // bg={!tokenInfo?.symbol && 'gray.800'}

            >
                <HStack flex={1}>
                    <Input
                        ref={ref}
                        type="number"
                        value={value?.amount || ""}
                        variant="unstyled"
                        color="brand.500"
                        placeholder='0.00'
                        disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)}
                        // onFocus={onInputFocus}
                        onChange={({ target }) => onChange({ ...token, amount: target.value })}
                    />

                    {
                        minMax && (
                            <HStack visibility={{ base: 'hidden', md: 'visible' }}>
                                <Button disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)} variant="outline" size="xs" onClick={() => onChange({ ...token, amount: balance / 2 })}>half</Button>
                                <Button disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)} variant="outline" size="xs" onClick={() => onChange({ ...token, amount: balance })}>max</Button>
                            </HStack>
                        )

                    }
                </HStack>
            </HStack>


            <HStack
                minWidth="180px"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRightRadius="30px"
                height={12}
                paddingX={2}

            >
                <HStack flex={1}>
                    {
                        showList ? (
                            <AssetSelectModal onChange={onChange} currentToken={tokenInfo?.symbol} disabled={disabled}>
                                {tokenInfo?.symbol ? (
                                    <>
                                        {
                                            image && (
                                                <Image
                                                    style={{ margin: 'unset' }}
                                                    maxH={{ base: 5, md: 7 }}
                                                    src={tokenInfo?.logoURI} alt="logo-small"
                                                    boxSize="2.5rem"
                                                    fallback={<FallbackImage />}
                                                />
                                            )
                                        }
                                        <Text fontSize="16px" fontWeight="400">{tokenInfo?.symbol || 'Select Token'}</Text>

                                    </>) :
                                    <Text
                                        paddingLeft="10px"
                                        fontSize="18px"
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
                                justifyContent="flex-start"
                                width="200px"
                                sx={{ 'button': { margin: 'unset' } }}
                                // paddingX={3}
                            // style={{ margin: "unset" }}
                            >
                                {image && <Image
                                    style={{ margin: 'unset' }}
                                    maxH={{ base: 5, md: 7 }}
                                    src={tokenInfo?.logoURI}
                                    alt="logo-small"
                                    boxSize="2.5rem"
                                    fallback={<FallbackImage />} />
                                }

                                <Text
                                    paddingLeft="10px"
                                    fontSize="16px"
                                    fontWeight="400">{tokenInfo?.symbol || token?.tokenSymbol}</Text>
                            </HStack>
                        )
                    }
                </HStack>
            </HStack>
        </HStack>

    )

})

export default AssetInput