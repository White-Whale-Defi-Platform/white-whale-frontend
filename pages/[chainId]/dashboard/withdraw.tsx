import BondingActions from 'components/Pages/BondingActions'
import { ActionType } from 'components/Pages/Dashboard/BondingOverview'

const WithdrawPage = () => <BondingActions globalAction={ActionType.withdraw} />

export default WithdrawPage
