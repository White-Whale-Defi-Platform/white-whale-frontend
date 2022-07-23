import { Box } from "@chakra-ui/react"


const FallbackImage = ({
    width = "6",
    height = "6",
    color = ["#3CCD6440", "#0075FF40"]
}) => <Box
        width={width}
        height={height}
        borderRadius="full"
        bgGradient={`radial-gradient(circle at top, ${color?.[0]}, transparent),radial-gradient(circle at bottom, ${color?.[1]}, transparent)`} />

export default FallbackImage