import { PersistState } from 'redux-persist'
import { RouterPreference } from 'state/routing/types'
import { UserState } from 'state/user/reducer'

export type PersistAppStateV4 = {
  _persist: PersistState
} & { user?: UserState }

/**
 * Migration to migrate users to UniswapX by default.
 */
export const migration4 = (state: PersistAppStateV4 | undefined) => {
  // If the the user has previously disabled UniswapX *during the opt-out rollout period*, we respect that preference.
  if (state?.user && !state.user?.optedOutOfUniswapX) {
    return {
      ...state,
      user: {
        ...state.user,
        userRouterPreference: RouterPreference.X,
      },
      _persist: {
        ...state._persist,
        version: 4,
      },
    }
  }
  return state
}
