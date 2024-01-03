import React, { useState, FC, ReactNode } from 'react'

import {
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { TokenBalance } from 'components/Pages/Bonding/BondingActions/Bond'
import { Asset } from 'types/index'

import AssetList from './AssetList'
import SearchInput from './SearchInput'

interface AssetSelectModalProps {
  children: ReactNode
  currentToken: string[]
  edgeTokenList: string[]
  onChange: (asset: Asset, isTokenChange?: boolean) => void
  disabled: boolean
  amount?: number
  isBonding?: boolean
  unbondingBalances?: TokenBalance[]
}

const AssetSelectModal: FC<AssetSelectModalProps> = ({
  children,
  onChange,
  currentToken = [],
  edgeTokenList = [],
  disabled,
  amount,
  isBonding = false,
  unbondingBalances = null,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [search, setSearch] = useState<string>('')

  const onAssetChange = (asset, isTokenChange) => {
    setSearch(asset?.asset)
    const newAsset = { ...asset,
      amount }
    onChange(newAsset, isTokenChange)
    onClose()
  }

  return (
    <>
      <HStack
        tabIndex={0}
        role="button"
        onClick={() => !disabled && onOpen()}
        justifyContent="space-between"
        width={['full', 'fit-content']}
      >
        {children}
      </HStack>
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={{ base: 'full',
          md: '2xl' }}
      >
        <ModalOverlay />
        <ModalContent backgroundColor="#1C1C1C">
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
              onChange={onAssetChange}
              search={search}
              edgeTokenList={edgeTokenList}
              currentToken={currentToken}
              isBonding={isBonding}
              unbondingBalances={unbondingBalances}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AssetSelectModal
