import { MendableSearchBar } from '@mendable/search'
import { RowFixed } from 'components/Row'
import { useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'

const StyledSearch = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  right: 0;
  bottom: 0;
  padding: 1rem;
  color: theme.deprecated_yellow3;
  transition: 250ms ease color;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    display: none;
  `}
`

export default function MendableSearch() {
  const [darkMode] = useDarkModeManager()

  return (
    <>
      <RowFixed>
        <StyledSearch>
          <MendableSearchBar
            style={{ darkMode, accentColor: '#8559F4' }}
            placeholder="Ask me anything"
            dialogPlaceholder="What are you looking for?"
            anon_key="eea51742-1c13-4611-90b1-581dce6ca930"
          />
        </StyledSearch>
      </RowFixed>
    </>
  )
}
