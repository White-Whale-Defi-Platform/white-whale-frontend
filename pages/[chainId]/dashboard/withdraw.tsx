import BondingActions from 'components/Pages/Dashboard/BondingActions'
import { ActionType } from 'components/Pages/Dashboard/BondingOverview'

const WithdrawPage = () => <BondingActions globalAction={ActionType.withdraw} />

export default WithdrawPage
