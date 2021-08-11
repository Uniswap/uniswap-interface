import PositionListItem from 'components/PositionListItem'
import React from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { PositionDetails } from 'types/position'
import { useUserHideClosedPositions } from 'state/user/hooks'
import { TYPE } from 'theme'

const DesktopHeader = styled.div`
  display: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px;

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    align-items: center;
    display: flex;

    display: grid;
    grid-template-columns: 1fr auto;
    & > div:last-child {
      text-align: right;
    }
  }
`

const MobileHeader = styled.div`
  font-weight: medium;
  font-size: 16px;
  font-weight: 500;
  padding: 8px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: none;
  }
`

const ShowInactiveToggle = styled.div`
  display: flex;
  align-items: center;
  justify-items: end;
  align-self: flex-end;
  grid-column-gap: 4px;
  padding: 0 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 12px;
  `};
`

type PositionListProps = React.PropsWithChildren<{
  positions: PositionDetails[]
}>

export default function PositionList({ positions }: PositionListProps) {
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  return (
    <>
      <DesktopHeader>
        <div>
          <Trans>Your positions</Trans>
          {positions && ' (' + positions.length + ')'}
        </div>
        <ShowInactiveToggle>
          <label>
            <TYPE.body onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}>
              <Trans>Show closed positions</Trans>
            </TYPE.body>
          </label>
          <input
            type="checkbox"
            onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}
            checked={!userHideClosedPositions}
          />
        </ShowInactiveToggle>
      </DesktopHeader>
      <MobileHeader>
        <Trans>Your positions</Trans>
      </MobileHeader>
      {positions.map((p) => {
        return <PositionListItem key={p.tokenId.toString()} positionDetails={p} />
      })}
    </>
  )
}
