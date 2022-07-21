import React from 'react'
import { SlideFade } from '@chakra-ui/react'


const Page = ({ children, slide = false }) => {
    return (
        <SlideFade in={true} offsetX={slide ? "200px" : "-200px"} >
            {children}
        </SlideFade>
    )
}

export default Page