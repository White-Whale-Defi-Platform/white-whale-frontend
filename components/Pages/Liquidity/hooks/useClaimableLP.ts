import { useMemo } from "react"
import usePositions from "./usePositions"


const useClaimableLP = ({ poolId }) => {

    const { data: positions = [] } = usePositions(poolId)

    return useMemo(() => {

        //filter out positions that are not open and are not unbound and add total of amount
        return positions?.filter(p => !p.isOpen && p.state === "unbound")
            .reduce((acc, p) => acc + Number(p.amount), 0)

    }, [positions, poolId])
}

export default useClaimableLP