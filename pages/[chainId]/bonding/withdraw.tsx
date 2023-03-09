import { ActionType } from '../../../components/Pages/Bonding/BondingOverview'
import BondingActions from '../../../components/Pages/BondingActions'

const WithdrawPage = () =>  <BondingActions globalAction={ActionType.withdraw}/>

export default WithdrawPage
