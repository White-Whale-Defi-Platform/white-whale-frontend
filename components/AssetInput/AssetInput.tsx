import { Input, forwardRef, Button, HStack, Image, Text, IconButton, Stack, VStack } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import AssetSelectModal from './AssetSelectModal';
import { FC } from 'react'
// import { Asset } from 'types/blockchain'
import { useTokenInfo } from 'hooks/useTokenInfo'
import FallbackImage from 'components/FallbackImage'
import { useTokenList } from 'hooks/useTokenList'
import { useMultipleTokenBalance } from 'hooks/useTokenBalance'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'

interface AssetInputProps {
    image?: boolean;
    token: any;
    value: any;
    onChange: (value: any, isTokenChange?: boolean) => void;
    showList?: boolean;
    onInputFocus?: () => void;
    balance?: number;
    disabled?: boolean;
    minMax?: boolean
    isSingleInput?: boolean;
    hideToken?: string;
    edgeTokenList? : string[]
    ignoreSlack?: boolean
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
    isSingleInput = false,
    hideToken,
    edgeTokenList,
    ignoreSlack = false

},
    ref) => {

    const tokenInfo = useTokenInfo(token?.tokenSymbol)
    const baseToken = useBaseTokenInfo()

    const [tokenList] = useTokenList()
    useMultipleTokenBalance(tokenList?.tokens?.map(({ symbol }) => symbol))

    return (
        <Stack
            direction={['column-reverse', "row"]}
            width="full"
            spacing={0}
            gap={[3, 0]}
        >
            <HStack
                width="full"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderLeftRadius="30px"
                borderRightRadius={["30px", "unset"]}
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
                                <Button
                                    disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)}
                                    variant="outline"
                                    size="xs"
                                    onClick={() => onChange({ ...token, amount: Number(balance / 2).toFixed(6) })}>
                                    half
                                </Button>
                                <Button
                                    disabled={disabled || (!isSingleInput && !tokenInfo?.symbol)}
                                    variant="outline"
                                    size="xs"
                                    onClick={() => onChange({ ...token, amount: (tokenInfo?.symbol === baseToken?.symbol && !ignoreSlack) ? Number(balance - 0.10).toFixed(6) : balance })}>
                                    max
                                </Button>
                            </HStack>
                        )

                    }
                </HStack>
            </HStack>


            <HStack   

                // minWidth="180px"
                width={["full", "180px"]}
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRightRadius="30px"
                borderLeftRadius={["30px", "unset"]}
                height={12}
                paddingX={2}
                justifyContent={'flex-end'}

            >

                <HStack flex={1}>
                    {
                        showList ? (
                            <AssetSelectModal
                                onChange={onChange}
                                currentToken={[tokenInfo?.symbol || hideToken]}
                                edgeTokenList={edgeTokenList}
                                disabled={disabled}
                                amount={token.amount}
                            >

                                {tokenInfo?.symbol ? (
                                    <HStack pl={[4,0]} gap={[1]} >
                                        {
                                            image && (
                                                <Image
                                                    width="auto"
                                                    minW="1.5rem"
                                                    maxW="1.5rem"
                                                    maxH="1.5rem"
                                                    style={{ margin: 'unset' }}
                                                    src={tokenInfo?.logoURI} alt="logo-small"
                                                    // boxSize="2.5rem"
                                                    fallback={<FallbackImage />}
                                                />
                                            )
                                        }
                                        <Text fontSize="16px" fontWeight="400">{tokenInfo?.symbol || 'Select Token'}</Text>

                                    </HStack>) :
                                    <Text
                                        paddingLeft="10px"
                                        fontSize="18px"
                                        fontWeight="400"
                                        color="brand.50">
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
                                width={["full", 'fit-content']}
                                sx={{ 'button': { margin: 'unset' } }}
                                pl={[4,0]} 
                                gap={[1]}
                            // paddingX={3}
                            // style={{ margin: "unset" }}
                            >
                                {image && <Image
                                    style={{ margin: 'unset' }}
                                    maxH={{ base: 5, md: 7 }}
                                    src={tokenInfo?.logoURI}
                                    alt="logo-small"
                                    // boxSize="2.5rem"
                                    fallback={<FallbackImage />} />
                                }

                                <Text
                                    paddingLeft={!image && "10px"}
                                    fontSize="16px"
                                    fontWeight="400">{tokenInfo?.symbol || token?.tokenSymbol}</Text>
                            </HStack>
                        )
                    }
                </HStack>
            </HStack>
        </Stack>

    )

})

export default AssetInput