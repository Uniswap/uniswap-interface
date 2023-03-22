import { Trans } from '@lingui/macro'
import AlertTriangleFilled from 'components/Icons/AlertTriangleFilled'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import styled from 'styled-components/macro'

import { ThemedText } from '../../theme'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export const PopupAlertTriangle = styled(AlertTriangleFilled)`
  flex-shrink: 0;
  color: ${({ theme }) => (theme.darkMode ? theme.backgroundSurface : 'white')};
  width: 32px;
  height: 32px;
  margin-right: 12px;
`

export default function FailedNetworkSwitchPopup({ chainId }: { chainId: SupportedChainId }) {
  const chainInfo = getChainInfo(chainId)

  return (
    <RowNoFlex>
      <PopupAlertTriangle />
      <AutoColumn gap="sm" margin="0 12px 0">
        <ThemedText.SubHeader color="textSecondary">
          <Trans>Failed to switch networks</Trans>
        </ThemedText.SubHeader>

        <ThemedText.BodySmall color="textSecondary">
          <Trans>To use Uniswap on {chainInfo.label}, switch the network in your wallet’s settings.</Trans>
        </ThemedText.BodySmall>
      </AutoColumn>
    </RowNoFlex>
  )
}
