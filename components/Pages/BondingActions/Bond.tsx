import { useState } from 'react'
import { VStack } from '@chakra-ui/react'
import AssetInput from '../../AssetInput'
import { useTokenBalance } from '../../../hooks/useTokenBalance'

const Bond = ({ }) => {

    const [token, setToken] = useState({
        amount: 0,
        tokenSymbol: "ampWHALE",
    })

    const { balance: balance } = useTokenBalance(
        "ampWHALE"
      )

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
            edgeTokenList={[]}
            onChange={(value) => setToken(value)}
        />
    </VStack>
}

export default Bond
