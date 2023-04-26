import BondingActions from 'components/Pages/BondingActions'
import {ActionType} from "components/Pages/Dashboard/BondingOverview";

const BondPage = () => {


  return <BondingActions globalAction={ActionType.bond}/>
}

export default BondPage
