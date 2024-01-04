import BondingActions from 'components/Pages/Bonding/BondingActions'
import { ActionType } from 'components/Pages/Bonding/BondingOverview'

const WithdrawPage = () => <BondingActions globalAction={ActionType.withdraw} />

export default WithdrawPage
