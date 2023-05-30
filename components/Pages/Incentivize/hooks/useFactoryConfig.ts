import { useMemo } from "react"
import { useQuery } from "react-query"
import { useRecoilValue } from "recoil"
import { walletState } from "state/atoms/walletAtoms"

type FactoryConfig = {
    createFlowFee: {
        amount: string
        denom: string
    }
}

const useFactoryConfig = (incentiveFactory:string) => {

    const { address, client } = useRecoilValue(walletState)

    const { data: config } = useQuery<FactoryConfig>({
        queryKey: ['factoryConfig', incentiveFactory],
        queryFn: () => client?.queryContractSmart(incentiveFactory, {
            config: {}
        })
        .then(data => ({
            createFlowFee : {
                amount: data?.create_flow_fee?.amount,
                denom : data?.create_flow_fee?.info?.native_token?.denom,
            }
        })),
        enabled: !!incentiveFactory && !!client,
    })

    return useMemo(() => config, [config])
}

export default useFactoryConfig