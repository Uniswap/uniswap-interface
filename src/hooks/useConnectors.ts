import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { ConnectionType } from 'connection'
import { getConnection } from 'connection/utils'
import { useMemo } from 'react'
import { BACKFILLABLE_WALLETS } from 'state/connection/constants'
import { useAppSelector } from 'state/hooks'

const SELECTABLE_WALLETS = [...BACKFILLABLE_WALLETS, ConnectionType.FORTMATIC]

export default function useConnectors() {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = []

    // Always attempt to use to Gnosis Safe first, as we can't know if we're in a SafeContext.
    orderedConnectionTypes.push(ConnectionType.GNOSIS_SAFE)

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedWallet) {
      orderedConnectionTypes.push(selectedWallet)
    }
    orderedConnectionTypes.push(...SELECTABLE_WALLETS.filter((wallet) => wallet !== selectedWallet))

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectionType.INFURA)

    // Convert to web3-react's representation of connectors.
    const web3Connectors: [Connector, Web3ReactHooks][] = orderedConnectionTypes
      .map(getConnection)
      .map(({ connector, hooks }) => [connector, hooks])
    return web3Connectors
  }, [selectedWallet])
}
