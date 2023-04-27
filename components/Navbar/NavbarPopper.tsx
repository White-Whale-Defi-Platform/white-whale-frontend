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
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import NavbarLink from './NavbarLink'
const NavbarPopper = ({ menu, currentChainName }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const firstFieldRef = React.useRef(null)
  const numberOfLinks = menu.children?.length

  const { asPath } = useRouter()

  const isActiveLink = useMemo(() => {
    // children defining sub menu items
    const [linkInAsPath] =
      menu?.children === undefined
        ? [asPath.includes(menu.link)]
        : (menu.children ?? []).filter((item: { link: string }) =>
            asPath.includes(item.link)
          )
    return !!linkInAsPath
  }, [asPath, menu])

  const openLink = (url: string): (() => void) => {
    return () => {
      window.open(url, '_blank')
    }
  }

  return (
    <Popover
      placement="bottom"
      isOpen={isOpen}
      initialFocusRef={firstFieldRef}
      // children defining sub menu items
      onOpen={
        menu.isExternal
          ? openLink(menu.link)
          : menu?.children === undefined
          ? () => window.location.assign(`/${currentChainName}${menu.link}`)
          : onOpen
      }
      onClose={onClose}
    >
      <PopoverTrigger>
        <HStack as={Button} variant="unstyled">
          <Text
            fontSize={['14px', '16px']}
            color={isActiveLink ? 'white' : 'brand.50'}
          >
            {menu.label}
          </Text>
        </HStack>
      </PopoverTrigger>

      <PopoverContent
        borderColor="#1C1C1C"
        borderRadius="25px"
        backgroundColor="#1C1C1C"
        width="auto"
      >
        <PopoverArrow
          bg="#1C1C1C"
          boxShadow="unset"
          style={{ boxShadow: 'unset' }}
          sx={{ '--popper-arrow-shadow-color': '#1C1C1C' }}
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
