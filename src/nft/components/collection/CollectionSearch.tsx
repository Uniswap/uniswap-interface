import clsx from 'clsx'
import { Box } from 'nft/components/Box'
import * as styles from 'nft/components/collection/CollectionSearch.css'
import { useIsCollectionLoading } from 'nft/hooks'
import { useCollectionFilters } from 'nft/hooks/useCollectionFilters'
import { FormEvent } from 'react'

export const CollectionSearch = () => {
  const setSearchByNameText = useCollectionFilters((state) => state.setSearch)
  const searchByNameText = useCollectionFilters((state) => state.search)
  const isCollectionLoading = useIsCollectionLoading((state) => state.isCollectionLoading)

  return (
    <Box
      as="input"
      borderColor={{ default: 'backgroundOutline', focus: 'genieBlue' }}
      borderWidth="1px"
      borderStyle="solid"
      borderRadius="12"
      padding="12"
      backgroundColor="backgroundSurface"
      fontSize="16"
      height="44"
      color={{ placeholder: 'textSecondary', default: 'textPrimary' }}
      value={searchByNameText}
      placeholder={isCollectionLoading ? '' : 'Search by name'}
      className={clsx(isCollectionLoading && styles.filterButtonLoading)}
      onChange={(e: FormEvent<HTMLInputElement>) => {
        setSearchByNameText(e.currentTarget.value)
      }}
    />
  )
}
