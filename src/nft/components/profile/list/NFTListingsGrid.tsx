import { Trans } from '@lingui/macro'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Box } from 'nft/components/Box'
import { SortDropdown } from 'nft/components/common/SortDropdown'
import { useSellAsset } from 'nft/hooks'
import { DropDownOption, ListingMarket } from 'nft/types'
import { useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { BREAKPOINTS } from 'theme'

import * as styles from './ListPage.css'
import { NFTListRow } from './NFTListRow'

const GridWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TableHeader = styled.div`
  display: flex;
  position: sticky;
  align-items: center;
  top: 72px;
  padding-top: 24px;
  padding-bottom: 24px;
  z-index: 1;
  background-color: ${({ theme }) => theme.backgroundBackdrop};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
`

const NFTHeader = styled.div`
  flex: 2;

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    flex: 1.5;
  }
`

const PriceHeaders = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    flex: 3;
  }
`

const PriceInfoHeader = styled.div`
  display: none;
  flex: 1;

  @media screen and (min-width: ${BREAKPOINTS.xl}px) {
    display: flex;
  }
`

const DropdownWrapper = styled.div`
  flex: 2;
`

export enum SetPriceMethod {
  SAME_PRICE,
  FLOOR_PRICE,
  PREV_LISTING,
}

export const NFTListingsGrid = ({ selectedMarkets }: { selectedMarkets: ListingMarket[] }) => {
  const sellAssets = useSellAsset((state) => state.sellAssets)
  const [globalPriceMethod, setGlobalPriceMethod] = useState<SetPriceMethod>()
  const [globalPrice, setGlobalPrice] = useState<number>()

  const priceDropdownOptions: DropDownOption[] = useMemo(
    () => [
      {
        displayText: 'Same price',
        onClick: () => setGlobalPriceMethod(SetPriceMethod.SAME_PRICE),
      },
      {
        displayText: 'Floor price',
        onClick: () => setGlobalPriceMethod(SetPriceMethod.FLOOR_PRICE),
      },
      {
        displayText: 'Prev. listing',
        onClick: () => setGlobalPriceMethod(SetPriceMethod.PREV_LISTING),
      },
    ],
    []
  )

  return (
    <GridWrapper>
      <TableHeader>
        <NFTHeader>
          <Trans>NFT</Trans>
        </NFTHeader>
        <PriceHeaders>
          <PriceInfoHeader>
            <Trans>Floor</Trans>
          </PriceInfoHeader>
          <PriceInfoHeader>
            <Trans>Last</Trans>
          </PriceInfoHeader>
          <DropdownWrapper>
            <SortDropdown dropDownOptions={priceDropdownOptions} mini miniPrompt={t`Set price by`} />
          </DropdownWrapper>

          <Box flex="1" display={{ sm: 'none', lg: 'flex' }} justifyContent="flex-end">
            <Trans>Fees</Trans>
          </Box>
          <Box flex="1.5" display={{ sm: 'none', lg: 'flex' }} justifyContent="flex-end">
            <Trans>You receive</Trans>
          </Box>
        </PriceHeaders>
      </TableHeader>
      {sellAssets.map((asset) => {
        return (
          <>
            <NFTListRow
              asset={asset}
              globalPriceMethod={globalPriceMethod}
              globalPrice={globalPrice}
              setGlobalPrice={setGlobalPrice}
              selectedMarkets={selectedMarkets}
            />
            {sellAssets.indexOf(asset) < sellAssets.length - 1 && <hr className={styles.nftDivider} />}
          </>
        )
      })}
    </GridWrapper>
  )
}
