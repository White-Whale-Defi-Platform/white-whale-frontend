import { useMemo } from "react"
import usePositions from "./usePositions"

const useMultiplicator = (poolId) => {
    const { data: positions = [] } = usePositions(poolId)

    const multiplicator = useMemo(() => {

        const { amount , weight  } = positions?.reduce((acc, position) => {
            const { amount , weight  } = position
            return {
                amount: acc.amount + Number(amount),
                weight: acc.weight + Number(weight),
            }
        }, {
            amount: 0,
            weight: 0,
        })

        return parseFloat((weight/amount).toFixed(2)) || 0
    }, [positions])


    return multiplicator
}

export default useMultiplicator