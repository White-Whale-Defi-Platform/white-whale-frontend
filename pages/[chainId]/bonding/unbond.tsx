import BondingActions from 'components/Pages/Dashboard/BondingActions'
import { ActionType } from 'components/Pages/Dashboard/BondingOverview'

const UnbondPage = () => <BondingActions globalAction={ActionType.unbond} />

export default UnbondPage
