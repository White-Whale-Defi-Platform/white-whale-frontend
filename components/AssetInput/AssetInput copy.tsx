import { Input, forwardRef, Button, HStack, Image, Text, IconButton, Divider } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import AssetSelectModal from './AssetSelectModal';
import { FC } from 'react'
// import { Asset } from 'types/blockchain'
import {Asset} from 'hooks/useAsset';

interface AssetInputProps {
    token: any,
    value: Asset,
    onChange: (value: Asset) => void,
    showList?: boolean,
    onInputFocus?: () => void
}


const AssetInput: FC<AssetInputProps> = forwardRef(({ token, onChange, value, showList = true, onInputFocus }, ref) => {

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
                    // onFocus={onInputFocus}
                    onChange={({ target }) => onChange({ ...token, amount: target.value })}
                />
                <Button variant="outline" size="xs" onClick={() => onChange({ ...token, amount: token?.balance / 2 })}>half</Button>
                <Button variant="primary" size="xs" onClick={() => onChange({ ...token, amount: token?.balance })}>max</Button>
            </HStack>
            <Divider orientation='vertical' h="50px" />
            {
                showList ? (
                    <AssetSelectModal onChange={onChange} currentToken={token?.name}>
                        <Image src={token?.logoURI} alt="logo-small" boxSize="2.5rem" />
                        <Text fontSize="20" fontWeight="400">{token?.symbol}</Text>
                        <IconButton
                            margin="unset"
                            variant="unstyled"
                            color="white"
                            aria-label='go back'
                            icon={<ChevronDownIcon />}
                        />
                    </AssetSelectModal>

                ) : (
                    <HStack
                        justifyContent="end"
                        width="fit-content"
                        paddingRight={2}
                    >
                        <Image src={token?.icon} alt="logo-small" boxSize="2.5rem" />
                        <Text fontSize="20" fontWeight="400">{token?.asset}</Text>
                    </HStack>
                )
            }

        </HStack>
    )
})

export default AssetInput