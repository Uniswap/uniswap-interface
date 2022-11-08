import clsx from 'clsx'
import { Box } from 'nft/components/Box'
import * as styles from 'nft/components/collection/FilterButton.css'
import { FilterIcon } from 'nft/components/icons'
import { buttonTextMedium } from 'nft/css/common.css'
import { useIsCollectionLoading } from 'nft/hooks'
import { putCommas } from 'nft/utils'

export const FilterButton = ({
  onClick,
  isMobile,
  isFiltersExpanded,
  collectionCount = 0,
}: {
  isMobile: boolean
  isFiltersExpanded: boolean
  onClick: () => void
  collectionCount?: number
}) => {
  const isCollectionNftsLoading = useIsCollectionLoading((state) => state.isCollectionNftsLoading)

  return (
    <Box
      className={
        isCollectionNftsLoading
          ? styles.filterButtonLoading
          : clsx(styles.filterButton, !isFiltersExpanded && styles.filterButtonExpanded)
      }
      display="flex"
      gap="8"
      borderRadius="12"
      fontSize="16"
      cursor="pointer"
      position="relative"
      onClick={onClick}
      padding="12"
      width={isMobile ? '44' : 'auto'}
      height="44"
      whiteSpace="nowrap"
      color="textPrimary"
    >
      <FilterIcon />
      {!isMobile ? (
        <>
          {!isFiltersExpanded && <Box className={buttonTextMedium}> Filter</Box>}
          <Box display="inline-block" position="relative" className={buttonTextMedium}>
            {!isFiltersExpanded && (
              <Box as="span" position="absolute" left="4" style={{ top: '5px' }}>
                •
              </Box>
            )}
            <Box paddingLeft={!isFiltersExpanded ? '12' : '4'}>
              {collectionCount > 0 ? putCommas(collectionCount) : 0} results
            </Box>
          </Box>
        </>
      ) : null}
    </Box>
  )
}
