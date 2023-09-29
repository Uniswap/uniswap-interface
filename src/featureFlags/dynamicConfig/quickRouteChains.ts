import { ChainId } from '@uniswap/sdk-core'
import { useFeatureFlagsContext } from 'featureFlags'

import { DynamicConfigName, useDynamicConfig } from '.'

// eslint-disable-next-line import/no-unused-modules
export function useQuickRouteChains(): ChainId[] {
  const config = useDynamicConfig(DynamicConfigName.quickRouteChains)
  const featureFlagsContext = useFeatureFlagsContext()
  let chains = config.get('chains', []) as ChainId[]

  const modalSetChains = featureFlagsContext.flags[DynamicConfigName.quickRouteChains]
  if (Array.isArray(modalSetChains) && modalSetChains !== chains) {
    chains = modalSetChains
  }
  if (chains.every((c) => Object.values(ChainId).includes(c))) {
    return chains
  } else {
    console.error('feature flag config chains contain invalid ChainId')
    return []
  }
}
