import React, { useMemo } from 'react'

import { ChevronDownIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { BRIDGE_NETWORK_DEFAULTS } from 'constants/index'
import { kBg } from 'constants/visualComponentConstants'
import { useRouter } from 'next/router'

import NavbarLink from './NavbarLink'

const NavbarPopper = ({ menu, currentChainName, chainId }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const firstFieldRef = React.useRef(null)
  const numberOfLinks = menu.children?.length

  const { asPath, push } = useRouter()

  const isActiveLink = useMemo(() => {
    const [linkInAsPath] =
      !menu?.children
        ? [asPath.includes(menu.link)]
        : (menu.children ?? []).filter((item: { link: string }) => asPath.includes(item.link))
    return Boolean(linkInAsPath)
  }, [asPath, menu])

  const openLink =
    (url: string): (() => void) => () => {
      window.open(url, '_blank')
    }

  return (
    <Popover
      placement="bottom"
      isOpen={isOpen}
      initialFocusRef={firstFieldRef}
      // Children defining sub menu items
      onOpen={
        menu.isExternal
          ? openLink(`${menu.link}/?chainFrom=${chainId}&chainTo=${BRIDGE_NETWORK_DEFAULTS[chainId]}`)
          : !menu?.children
            ? () => push(`/${currentChainName}${menu.link}`)
            : onOpen
      }
      onClose={onClose}
    >
      <PopoverTrigger>
        <HStack as={Button} variant="unstyled" >
          <Text
            fontSize={['14px', '16px']}
            color={isActiveLink ? 'white' : 'brand.50'}
          >
            {menu.label}
            {menu.children ? <ChevronDownIcon /> : null}
            {menu.isExternal ? (
              <ExternalLinkIcon paddingLeft={''} paddingBottom={'1'} />
            ) : null}
          </Text>
        </HStack>
      </PopoverTrigger>

      <PopoverContent
        borderColor={'transparent'}
        borderRadius="25px"
        backgroundColor={'rgba(0, 0, 0, 0.8)'}
        width="auto"
      >
        <PopoverArrow
          bg={kBg}
          boxShadow="unset"
          style={{ boxShadow: 'unset' }}
          sx={{ '--popper-arrow-shadow-color': kBg }}
        />
        <PopoverBody px="unset">
          <VStack overflow="hidden">
            {menu.children?.map(({ label, link }, index: number) => (
              <Box
                key={link}
                px={10}
                pb={2}
                width="full"
                borderBottom={
                  index === numberOfLinks - 1
                    ? 'unset'
                    : '1px solid rgba(255, 255, 255, 0.1);'
                }
                onClick={onClose}
              >
                <NavbarLink
                  key={label}
                  text={label}
                  href={`/${currentChainName}${link}`}
                />
              </Box>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default NavbarPopper
