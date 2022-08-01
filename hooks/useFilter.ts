import { useMemo } from 'react'

const useFilter = <T>(list:T[] = [], filterKey:string, filterValue:string):T[] => {

    return useMemo(() => {
        return list?.filter((item) => item[filterKey]?.toLowerCase()?.includes(filterValue))
    }, [list, filterKey, filterValue])
}

export default useFilter