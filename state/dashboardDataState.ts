import { DashboardData } from 'components/Pages/Dashboard/Dashboard'
import { atom } from 'recoil'
interface DashboardDataState {
  data: DashboardData[]
  isInitialized: boolean
}
export const dashboardDataState = atom<DashboardDataState>({
  key: 'dashboardData',
  default: {
    data: [],
    isInitialized: false,
  },
  effects_UNSTABLE: [],
})
