import { useMemo } from "react"
import { useQuery } from "react-query"
import { useRecoilValue } from "recoil"
import { walletState } from "state/atoms/walletAtoms"
import { num } from "libs/num"


const useFactoryConfig = (incentiveFactory) => {

    const { address, client } = useRecoilValue(walletState)

    const { data: config = [] } = useQuery({
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