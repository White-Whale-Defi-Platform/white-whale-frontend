import { useMemo } from "react"
import { usePoolsListQuery } from "queries/usePoolsListQuery"
import usePositions from "./usePositions"
import { useCosmwasmClient } from "hooks/useCosmwasmClient"
import { useRecoilValue } from "recoil"
import { walletState } from "state/atoms/walletAtoms"
import { useQuery } from "react-query"


const useClaimableLP = ({ poolId }) => {

    const { data: positions = [] } = usePositions(poolId)

    return useMemo(() => {

        //filter out positions that are not open and are not unbound and add total of amount
        return positions?.filter(p => !p.isOpen && p.state === "unbound")
            .reduce((acc, p) => acc + p.amount, 0)

    }, [positions, poolId])
}

export default useClaimableLP