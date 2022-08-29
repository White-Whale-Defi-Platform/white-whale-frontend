import React, { useState } from 'react'
import { Modal, ModalBody, ModalHeader, ModalOverlay, ModalContent, useDisclosure, HStack, VStack } from '@chakra-ui/react'
import SearchInput from './SearchInput'
import AssetList from './AssetList'
import { FC, ReactNode } from 'react'
import { Asset } from 'types/blockchain'



interface AssetSelectModalProps {
    children: ReactNode,
    currentToken: string[],
    edgeTokenList: string[],
    onChange: (asset: Asset, isTokenChange?: boolean) => void,
    disabled: boolean
    amount? : number
}

const AssetSelectModal: FC<AssetSelectModalProps> = ({ children, onChange, currentToken = [], edgeTokenList = [] , disabled, amount}) => {
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [search, setSearch] = useState<string>('')


    const onAssetChange = (asset, isTokenChange) => {
        setSearch(asset?.asset)
        const newAsset = {...asset, amount}
        onChange(newAsset, isTokenChange)
        onClose()
    }

    return (
        <>

            <HStack
                tabIndex={0}
                role='button'
                onClick={() => !disabled && onOpen()}
                justifyContent="space-between"
                width={["full","160px"]}
                // sx={{ 'button': {margin : 'unset'} }}
                // style={{margin : "unset"}}
            >
                {children}
            </HStack>

            <Modal onClose={onClose} isOpen={isOpen} isCentered size={{base:'full', md: '2xl'}} >
                <ModalOverlay />
                <ModalContent  backgroundColor="#212121">
                    <ModalHeader>Select Token</ModalHeader>
                    <ModalBody
                        as={VStack}
                        gap={3}
                        paddingX="unset"
                        alignItems="flex-start"
                    >
                        <SearchInput onChange={setSearch} />
                        <AssetList 
                            amount={amount}
                            // assetList={assets} 
                            onChange={onAssetChange} 
                            search={search} 
                            edgeTokenList={edgeTokenList}
                            currentToken={currentToken} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>

    )
}

export default AssetSelectModal