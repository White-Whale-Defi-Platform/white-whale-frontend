import { HStack, Image, Text } from '@chakra-ui/react'
import React from 'react'
import Link from 'next/link';

const Logo = () => {
    return (
        <HStack alignItems="center">
            <Link href="/" passHref>
                <a>
                    <Image src="/img/logo.svg" alt="WhiteWhale Logo" boxSize={[8,12]} />
                </a>
            </Link>
            <HStack display={['none', 'flex']}>
                <Text pl={2} fontSize="26" fontWeight="400">White</Text>
                <Text fontSize="26" fontWeight="700">Whale</Text>
            </HStack>

        </HStack>

    )
}

export default Logo