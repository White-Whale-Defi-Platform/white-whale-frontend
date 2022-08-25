import React, { useState, useEffect, FC } from 'react'
import { HStack, Input } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons';
import useDebounceValue from 'hooks/useDebounceValue';

interface Props {
    onChange?: (value: string) => void
}

const SearchInput: FC<Props> = ({ onChange }) => {
    const [search, setSearch] = useState<string>('')
    const token = useDebounceValue(search, 200)

    useEffect(() => {
        onChange?.(token)
    }, [token])

    return (
        <HStack
            paddingX={6}
            width="full"
        >
            <HStack
                borderRadius="100px"
                border="1px solid rgba(255, 255, 255, 0.1)"
                width="full"
                paddingY={3}
                paddingX={6}
            >
                <Input
                    placeholder='Search Token'
                    variant="unstyled"
                    color="brand.500"
                    onChange={({ target: { value } }) => setSearch(value)}
                />
                <SearchIcon color='green.500' />
            </HStack>
        </HStack>
    )
}

export default SearchInput