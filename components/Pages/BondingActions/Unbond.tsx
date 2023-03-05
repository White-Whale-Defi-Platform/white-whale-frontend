import { useState } from 'react'
import { VStack } from '@chakra-ui/react'
import AssetInput from '../../AssetInput'

const Unbond = ({ }) => {

    const [token, setToken] = useState({
        amount: 0,
        tokenSymbol: "ampWHALE",
    })

    const edgeTokenList = ["ampWHALE", "bWHALE"]

    return <VStack
        px={7}
        width="full"
        alignItems="flex-start"
        paddingBottom={5}>
        <AssetInput
            value={token}
            token={token}
            disabled={false}
            minMax={true}
            balance={100}
            showList={true}
            edgeTokenList={edgeTokenList}
            onChange={(value) => setToken(value)}
        />
    </VStack>

}

export default Unbond