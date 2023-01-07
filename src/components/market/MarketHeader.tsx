import { Trans } from '@lingui/macro'
import { Switch } from '@material-ui/core'
import { Percent } from '@uniswap/sdk-core'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { useExpertModeManager } from '../../state/user/hooks'
import { RowBetween, RowFixed } from '../Row'
import SettingsTab from '../Settings'

const StyledMarketHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`

export default function MarketHeader({ allowedSlippage }: { allowedSlippage: Percent }) {
  const [expertMode, toggleExpertMode] = useExpertModeManager()

  return (
    <StyledMarketHeader>
      <RowBetween>
        <RowFixed>
          <Text>
            <Trans>Show Chart</Trans>
          </Text>
          <Switch checked={expertMode} color="primary" onClick={() => toggleExpertMode()} />
        </RowFixed>
        <RowFixed>
          <SettingsTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledMarketHeader>
  )
}
