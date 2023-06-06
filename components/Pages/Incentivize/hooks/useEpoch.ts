
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);


const useEpoch = () => {


    const { address, client } = useRecoilValue(walletState)

    const contract = "migaloo1pl02gs047p84auvavwcawgfkehawv9vhgyndpyqyee796txelefq4np7kc"

    const { data } = useQuery<number>({
        queryKey: ['epoch', contract],
        queryFn: () => client?.queryContractSmart(contract, {
            current_epoch: {}
        }),
        enabled: !!contract && !!client,
    })

    const checkLocalAndUTC = () => {
        // Get the current local date
        const currentLocalDate = dayjs();

        // Get the current UTC date
        const currentUTCDate = dayjs().utc();

        // Check if local date is still the same and UTC date is one day forward
        const isSameLocalDate = currentUTCDate.isSame(dayjs(), 'day');
        // const isUTCOneDayForward = currentUTCDate.isAfter(currentLocalDate.add(1, 'day'), 'day');

        // Get yesterday's date
        const yesterday = currentUTCDate.subtract(1, 'day');

        return isSameLocalDate ? yesterday : currentLocalDate

    }

    const dateToEpoch = (date: string) => {

        // Check if the current epoch is available or return null
        if (!data?.epoch?.id) return null

        // Get the current epoch number
        const currentEpoch = Number(data?.epoch?.id)

        // Get the current local date
        const today = checkLocalAndUTC()

        // Set the start time of the current epoch to 15:00:00 UTC
        const startTime = dayjs(today).utc().set('hour', 15).set('minute', 0).set('second', 0).set('millisecond', 0);

        // Convert the given date to UTC
        const endTime = dayjs(date).utc();

        // Convert current epoch start time to UTC
        const currentEpochStart = dayjs.utc(startTime);

        // Calculate the difference between the current epoch start time and the future epoch end time
        const diff = endTime.diff(currentEpochStart, 'day')

        // Calculate the duration of each epoch in milliseconds
        const epochDuration = 86400000;

        // Calculate the start time of the future epoch based on the current epoch number and duration
        const futureEpochStartUTC = currentEpochStart.add((currentEpoch + diff) * epochDuration, 'millisecond');

        // Calculate the future epoch number based on the future epoch start time
        const epochNumber = Math.floor(futureEpochStartUTC.diff(currentEpochStart, 'millisecond') / epochDuration);

        return epochNumber;
    }

    const epochToDate = (givenEpoch) => {
        // Check if the current epoch is available or return null
        if (!data?.epoch?.id) return null

        // Get the current epoch number
        const currentEpoch = Number(data?.epoch?.id)


        // Set the start time of the epoch to 15:00:00 UTC
        const startTime = dayjs().utc().set('hour', 15).set('minute', 0).set('second', 0).set('millisecond', 0);

        // Calculate the duration of each epoch in milliseconds
        const epochDuration = 86400000; 

        // Calculate the timestamp of the given epoch
        const givenTimestamp = startTime.valueOf() + (givenEpoch - currentEpoch) * epochDuration;

        // Convert the timestamp to a dayjs instance in local time
        const givenEpochDate = dayjs(givenTimestamp).local();

        // Return the formatted date for the given epoch
        return givenEpochDate.format('YYYY/MM/DD');
    }

    //   // Example usage
    //   const currentEpoch = 27;
    //   const givenEpoch = 30;

    //   const epochDate = getEpochDate(currentEpoch, givenEpoch);
    //   console.log({epochDate});





    const currentEpoch = useMemo(() => {

        if(!data?.epoch?.id) return null

        return Number(data?.epoch?.id)

    }, [data])
    return {
        // currentEpoch,
        dateToEpoch,
        epochToDate,
        currentEpoch
    }


}

export default useEpoch