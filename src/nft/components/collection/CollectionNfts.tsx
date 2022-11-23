import { BigNumber } from '@ethersproject/bignumber'
import { TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, ElementName, EventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import clsx from 'clsx'
import { OpacityHoverState } from 'components/Common'
import { parseEther } from 'ethers/lib/utils'
import { NftAssetTraitInput, NftMarketplace } from 'graphql/data/nft/__generated__/AssetQuery.graphql'
import {
  ASSET_PAGE_SIZE,
  AssetFetcherParams,
  useLazyLoadAssetsQuery,
  useLoadSweepAssetsQuery,
} from 'graphql/data/nft/Asset'
import useDebounce from 'hooks/useDebounce'
import { AnimatedBox, Box } from 'nft/components/Box'
import { CollectionSearch, FilterButton } from 'nft/components/collection'
import { CollectionAsset } from 'nft/components/collection/CollectionAsset'
import * as styles from 'nft/components/collection/CollectionNfts.css'
import { SortDropdown } from 'nft/components/common/SortDropdown'
import { Center, Column, Row } from 'nft/components/Flex'
import { SweepIcon } from 'nft/components/icons'
import { bodySmall, buttonTextMedium, headlineMedium } from 'nft/css/common.css'
import { loadingAsset } from 'nft/css/loading.css'
import {
  CollectionFilters,
  initialCollectionFilterState,
  SortBy,
  SortByQueries,
  useBag,
  useCollectionFilters,
  useFiltersExpanded,
  useIsMobile,
} from 'nft/hooks'
import { useIsCollectionLoading } from 'nft/hooks/useIsCollectionLoading'
import { usePriceRange } from 'nft/hooks/usePriceRange'
import { DropDownOption, GenieAsset, GenieCollection, isPooledMarket, Markets, TokenType } from 'nft/types'
import {
  calcPoolPrice,
  calcSudoSwapPrice,
  getRarityStatus,
  isInSameMarketplaceCollection,
  isInSameSudoSwapPool,
  pluralize,
} from 'nft/utils'
import { scrollToTop } from 'nft/utils/scrollToTop'
import { applyFiltersFromURL, syncLocalFiltersWithURL } from 'nft/utils/urlParams'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { CollectionAssetLoading } from './CollectionAssetLoading'
import { MARKETPLACE_ITEMS, MarketplaceLogo } from './MarketplaceSelect'
import { Sweep, useSweepFetcherParams } from './Sweep'
import { TraitChip } from './TraitChip'

interface CollectionNftsProps {
  contractAddress: string
  collectionStats: GenieCollection
  rarityVerified?: boolean
}

const rarityStatusCache = new Map<string, boolean>()

const InfiniteScrollWrapperCss = css`
  margin: 0 16px;
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    margin: 0 20px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    margin: 0 26px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    margin: 0 48px;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  gap: 10px;
  justify-content: space-between;

  ${InfiniteScrollWrapperCss}
`

const ActionsSubContainer = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0px;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    gap: 10px;
  }
`

export const SortDropdownContainer = styled.div<{ isFiltersExpanded: boolean }>`
  width: max-content;
  height: 44px;
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    ${({ isFiltersExpanded }) => isFiltersExpanded && `display: none;`}
  }
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`

const EmptyCollectionWrapper = styled.div`
  display: block;
  text-align: center;
`

const ViewFullCollection = styled.span`
  ${OpacityHoverState}
`

export const ClearAllButton = styled.button`
  color: ${({ theme }) => theme.textTertiary};
  padding-left: 8px;
  padding-right: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: none;
`

const InfiniteScrollWrapper = styled.div`
  ${InfiniteScrollWrapperCss}
`

const SweepButton = styled.div<{ toggled: boolean; disabled?: boolean }>`
  display: flex;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 12px 18px 12px 12px;
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  color: ${({ toggled, disabled, theme }) => (toggled && !disabled ? theme.accentTextLightPrimary : theme.textPrimary)};
  background: ${({ theme, toggled, disabled }) =>
    !disabled && toggled
      ? 'radial-gradient(101.8% 4091.31% at 0% 0%, #4673FA 0%, #9646FA 100%)'
      : theme.backgroundInteractive};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  :hover {
    background-color: ${({ theme }) => theme.hoverState};
    transition: ${({
      theme: {
        transition: { duration, timing },
      },
    }) => `${duration.fast} background-color ${timing.in}`};
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 12px 12px 12px 12px;
  }
`

const SweepText = styled(ThemedText.BodyPrimary)`
  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    display: none;
  }
`

const MarketNameWrapper = styled(Row)`
  gap: 8px;
`

const LoadingAssets = () => (
  <>
    {Array.from(Array(ASSET_PAGE_SIZE), (_, index) => (
      <CollectionAssetLoading key={index} />
    ))}
  </>
)

export const CollectionNftsLoading = () => (
  <Box width="full" className={styles.assetList}>
    <LoadingAssets />
  </Box>
)

export const CollectionNftsAndMenuLoading = () => (
  <InfiniteScrollWrapper>
    <Column alignItems="flex-start" position="relative" width="full">
      <Row marginY="12" gap="12">
        <Box className={loadingAsset} borderRadius="12" width={{ sm: '44', md: '100' }} height="44" />
        <Box
          className={loadingAsset}
          borderRadius="12"
          height="44"
          display={{ sm: 'none', md: 'flex' }}
          style={{ width: '220px' }}
        />
        <Box className={loadingAsset} borderRadius="12" height="44" width={{ sm: '276', md: '332' }} />
      </Row>
      <CollectionNftsLoading />
    </Column>
  </InfiniteScrollWrapper>
)

export const getSortDropdownOptions = (setSortBy: (sortBy: SortBy) => void, hasRarity: boolean): DropDownOption[] => {
  const options = [
    {
      displayText: 'Price: Low to High',
      onClick: () => setSortBy(SortBy.LowToHigh),
      reverseIndex: 2,
      sortBy: SortBy.LowToHigh,
    },
    {
      displayText: 'Price: High to Low',
      onClick: () => setSortBy(SortBy.HighToLow),
      reverseIndex: 1,
      sortBy: SortBy.HighToLow,
    },
  ]
  return hasRarity
    ? options.concat([
        {
          displayText: 'Rarity: Rare to Common',
          onClick: () => setSortBy(SortBy.RareToCommon),
          reverseIndex: 4,
          sortBy: SortBy.RareToCommon,
        },
        {
          displayText: 'Rarity: Common to Rare',
          onClick: () => setSortBy(SortBy.CommonToRare),
          reverseIndex: 3,
          sortBy: SortBy.CommonToRare,
        },
      ])
    : options
}

export const CollectionNfts = ({ contractAddress, collectionStats, rarityVerified }: CollectionNftsProps) => {
  const { chainId } = useWeb3React()
  const traits = useCollectionFilters((state) => state.traits)
  const minPrice = useCollectionFilters((state) => state.minPrice)
  const maxPrice = useCollectionFilters((state) => state.maxPrice)
  const markets = useCollectionFilters((state) => state.markets)
  const sortBy = useCollectionFilters((state) => state.sortBy)
  const searchByNameText = useCollectionFilters((state) => state.search)
  const setMarketCount = useCollectionFilters((state) => state.setMarketCount)
  const setSortBy = useCollectionFilters((state) => state.setSortBy)
  const buyNow = useCollectionFilters((state) => state.buyNow)

  const setPriceRangeLow = usePriceRange((state) => state.setPriceRangeLow)
  const priceRangeLow = usePriceRange((state) => state.priceRangeLow)
  const priceRangeHigh = usePriceRange((state) => state.priceRangeHigh)
  const setPriceRangeHigh = usePriceRange((state) => state.setPriceRangeHigh)
  const setPrevMinMax = usePriceRange((state) => state.setPrevMinMax)

  const setIsCollectionNftsLoading = useIsCollectionLoading((state) => state.setIsCollectionNftsLoading)
  const removeTrait = useCollectionFilters((state) => state.removeTrait)
  const removeMarket = useCollectionFilters((state) => state.removeMarket)
  const reset = useCollectionFilters((state) => state.reset)
  const setMin = useCollectionFilters((state) => state.setMinPrice)
  const setMax = useCollectionFilters((state) => state.setMaxPrice)
  const setHasRarity = useCollectionFilters((state) => state.setHasRarity)

  const toggleBag = useBag((state) => state.toggleBag)
  const bagExpanded = useBag((state) => state.bagExpanded)
  const itemsInBag = useBag((state) => state.itemsInBag)

  const debouncedMinPrice = useDebounce(minPrice, 500)
  const debouncedMaxPrice = useDebounce(maxPrice, 500)
  const debouncedSearchByNameText = useDebounce(searchByNameText, 500)

  const [sweepIsOpen, setSweepOpen] = useState(false)
  // Load all sweep queries. Loading them on the parent allows lazy-loading, but avoids waterfalling requests.
  const collectionParams = useSweepFetcherParams(contractAddress, 'others', debouncedMinPrice, debouncedMaxPrice)
  const sudoSwapParams = useSweepFetcherParams(contractAddress, Markets.Sudoswap, debouncedMinPrice, debouncedMaxPrice)
  const nftxParams = useSweepFetcherParams(contractAddress, Markets.NFTX, debouncedMinPrice, debouncedMaxPrice)
  const nft20Params = useSweepFetcherParams(contractAddress, Markets.NFT20, debouncedMinPrice, debouncedMaxPrice)
  useLoadSweepAssetsQuery(collectionParams, sweepIsOpen)
  useLoadSweepAssetsQuery(sudoSwapParams, sweepIsOpen)
  useLoadSweepAssetsQuery(nftxParams, sweepIsOpen)
  useLoadSweepAssetsQuery(nft20Params, sweepIsOpen)

  const assetQueryParams: AssetFetcherParams = {
    address: contractAddress,
    orderBy: SortByQueries[sortBy].field,
    asc: SortByQueries[sortBy].asc,
    filter: {
      listed: buyNow,
      marketplaces: markets.length > 0 ? markets.map((market) => market.toUpperCase() as NftMarketplace) : undefined,
      maxPrice: debouncedMaxPrice ? parseEther(debouncedMaxPrice).toString() : undefined,
      minPrice: debouncedMinPrice ? parseEther(debouncedMinPrice).toString() : undefined,
      tokenSearchQuery: debouncedSearchByNameText,
      traits:
        traits.length > 0
          ? traits.map((trait) => {
              return { name: trait.trait_type, values: [trait.trait_value] } as unknown as NftAssetTraitInput
            })
          : undefined,
    },
    first: ASSET_PAGE_SIZE,
  }

  const { assets: collectionNfts, loadNext, hasNext, isLoadingNext } = useLazyLoadAssetsQuery(assetQueryParams)
  const handleNextPageLoad = useCallback(() => loadNext(ASSET_PAGE_SIZE), [loadNext])

  const getPoolPosition = useCallback(
    (asset: GenieAsset) => {
      const assetInBag = itemsInBag.some(
        (item) => asset.tokenId === item.asset.tokenId && asset.address === item.asset.address
      )

      if (asset.marketplace === Markets.Sudoswap) {
        const bagItemsInSudoSwapPool = itemsInBag.filter((item) => isInSameSudoSwapPool(asset, item.asset))
        if (assetInBag) {
          return bagItemsInSudoSwapPool.findIndex((item) => item.asset.tokenId === asset.tokenId)
        } else {
          return bagItemsInSudoSwapPool.length
        }
      }

      return assetInBag
        ? itemsInBag
            .filter((item) => isInSameMarketplaceCollection(asset, item.asset))
            .findIndex((item) => item.asset.tokenId === asset.tokenId)
        : itemsInBag.filter((item) => isInSameMarketplaceCollection(asset, item.asset)).length
    },
    [itemsInBag]
  )

  const calculatePrice = useCallback(
    (asset: GenieAsset) => {
      if (asset.marketplace === Markets.Sudoswap) return calcSudoSwapPrice(asset, getPoolPosition(asset))
      return calcPoolPrice(asset, getPoolPosition(asset))
    },
    [getPoolPosition]
  )

  const collectionAssets = useMemo(() => {
    if (!collectionNfts || !collectionNfts.some((asset) => asset.marketplace && isPooledMarket(asset.marketplace))) {
      return collectionNfts
    }

    const assets = [...collectionNfts]

    assets.forEach(
      (asset) =>
        asset.marketplace &&
        isPooledMarket(asset.marketplace) &&
        (asset.priceInfo.ETHPrice = calculatePrice(asset) ?? '')
    )

    if (sortBy === SortBy.HighToLow || sortBy === SortBy.LowToHigh) {
      assets.sort((a, b) => {
        const bigA = BigNumber.from(a.priceInfo?.ETHPrice ?? -1)
        const bigB = BigNumber.from(b.priceInfo?.ETHPrice ?? -1)

        if (bigA.gte(0) && bigB.lt(0)) {
          return sortBy === SortBy.LowToHigh ? -1 : 1
        } else if (bigB.gte(0) && bigA.lt(0)) {
          return sortBy === SortBy.LowToHigh ? 1 : -1
        }

        const diff = bigA.sub(bigB)
        if (diff.gt(0)) {
          return sortBy === SortBy.LowToHigh ? 1 : -1
        } else if (diff.lt(0)) {
          return sortBy === SortBy.LowToHigh ? -1 : 1
        }

        return 0
      })
    }

    return assets
  }, [collectionNfts, sortBy, calculatePrice])

  const [currentTokenPlayingMedia, setCurrentTokenPlayingMedia] = useState<string | undefined>()
  const [isFiltersExpanded, setFiltersExpanded] = useFiltersExpanded()
  const oldStateRef = useRef<CollectionFilters | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsCollectionNftsLoading(isLoadingNext)
  }, [isLoadingNext, setIsCollectionNftsLoading])

  const hasRarity = useMemo(() => {
    const hasRarity = getRarityStatus(rarityStatusCache, collectionStats?.address, collectionAssets) ?? false
    setHasRarity(hasRarity)
    return hasRarity
  }, [collectionStats.address, collectionAssets, setHasRarity])

  const sortDropDownOptions: DropDownOption[] = useMemo(
    () => getSortDropdownOptions(setSortBy, hasRarity),
    [hasRarity, setSortBy]
  )

  useEffect(() => {
    setSweepOpen(false)
    return () => {
      useCollectionFilters.setState(initialCollectionFilterState)
    }
  }, [contractAddress])

  const assets = useMemo(() => {
    if (!collectionAssets) return null
    return collectionAssets.map((asset) => (
      <CollectionAsset
        key={asset.address + asset.tokenId}
        asset={asset}
        isMobile={isMobile}
        mediaShouldBePlaying={asset.tokenId === currentTokenPlayingMedia}
        setCurrentTokenPlayingMedia={setCurrentTokenPlayingMedia}
        rarityVerified={rarityVerified}
      />
    ))
  }, [collectionAssets, currentTokenPlayingMedia, isMobile, rarityVerified])

  const hasNfts = collectionAssets && collectionAssets.length > 0
  const hasErc1155s = hasNfts && collectionAssets[0] && collectionAssets[0].tokenType === TokenType.ERC1155

  const minMaxPriceChipText: string | undefined = useMemo(() => {
    if (debouncedMinPrice && debouncedMaxPrice) {
      return `Price: ${debouncedMinPrice} - ${debouncedMaxPrice} ETH`
    } else if (debouncedMinPrice) {
      return `Min. Price: ${debouncedMinPrice} ETH`
    } else if (debouncedMaxPrice) {
      return `Max Price: ${debouncedMaxPrice} ETH`
    }

    return undefined
  }, [debouncedMinPrice, debouncedMaxPrice])

  useEffect(() => {
    const marketCount: any = {}
    collectionStats?.marketplaceCount?.forEach(({ marketplace, count }) => {
      marketCount[marketplace] = count
    })
    setMarketCount(marketCount)
    oldStateRef.current = useCollectionFilters.getState()
  }, [collectionStats?.marketplaceCount, setMarketCount])

  const location = useLocation()
  // Applying filters from URL to local state
  useEffect(() => {
    if (collectionStats?.traits) {
      const modifiedQuery = applyFiltersFromURL(location, collectionStats)

      requestAnimationFrame(() => {
        useCollectionFilters.setState(modifiedQuery as any)
      })

      useCollectionFilters.subscribe((state) => {
        if (JSON.stringify(oldStateRef.current) !== JSON.stringify(state)) {
          syncLocalFiltersWithURL(state)
          oldStateRef.current = state
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    if (collectionStats && collectionStats.stats?.floor_price) {
      const lowValue = collectionStats.stats?.floor_price
      const maxValue = 10 * collectionStats.stats?.floor_price

      if (priceRangeLow === '') {
        setPriceRangeLow(lowValue?.toFixed(2))
      }

      if (priceRangeHigh === '') {
        setPriceRangeHigh(maxValue.toFixed(2))
      }
    }
  }, [collectionStats, priceRangeLow, priceRangeHigh, setPriceRangeHigh, setPriceRangeLow])

  const handleSweepClick = useCallback(() => {
    if (hasErc1155s) return
    if (!sweepIsOpen) {
      scrollToTop()
      if (!bagExpanded && !isMobile) toggleBag()
    }
    setSweepOpen(!sweepIsOpen)
  }, [bagExpanded, hasErc1155s, isMobile, sweepIsOpen, toggleBag])

  const handleClearAllClick = useCallback(() => {
    reset()
    setPrevMinMax([0, 100])
    scrollToTop()
  }, [reset, setPrevMinMax])

  return (
    <>
      <AnimatedBox
        backgroundColor="backgroundBackdrop"
        position="sticky"
        top="72"
        width="full"
        zIndex="3"
        marginBottom={{ sm: '8', md: '20' }}
        paddingTop="16"
        paddingBottom="16"
      >
        <ActionsContainer>
          <ActionsSubContainer>
            <TraceEvent
              events={[BrowserEvent.onClick]}
              element={ElementName.NFT_FILTER_BUTTON}
              name={EventName.NFT_FILTER_OPENED}
              shouldLogImpression={!isFiltersExpanded}
              properties={{ collection_address: contractAddress, chain_id: chainId }}
            >
              <FilterButton
                isMobile={isMobile}
                isFiltersExpanded={isFiltersExpanded}
                collectionCount={collectionAssets?.[0]?.totalCount ?? 0}
                onClick={() => setFiltersExpanded(!isFiltersExpanded)}
              />
            </TraceEvent>
            <SortDropdownContainer isFiltersExpanded={isFiltersExpanded}>
              <SortDropdown dropDownOptions={sortDropDownOptions} />
            </SortDropdownContainer>
            <CollectionSearch />
          </ActionsSubContainer>
          {!hasErc1155s && (
            <SweepButton
              toggled={sweepIsOpen}
              disabled={hasErc1155s}
              className={buttonTextMedium}
              onClick={handleSweepClick}
            >
              <SweepIcon viewBox="0 0 24 24" width="20px" height="20px" />
              <SweepText fontWeight={600} color="currentColor" lineHeight="20px">
                Sweep
              </SweepText>
            </SweepButton>
          )}
        </ActionsContainer>
        <InfiniteScrollWrapper>
          {sweepIsOpen && (
            <Sweep contractAddress={contractAddress} minPrice={debouncedMinPrice} maxPrice={debouncedMaxPrice} />
          )}
          <Row
            paddingTop={!!markets.length || !!traits.length || minMaxPriceChipText ? '12' : '0'}
            gap="8"
            flexWrap="wrap"
          >
            {markets.map((market) => (
              <TraitChip
                key={market}
                value={
                  <MarketNameWrapper>
                    <MarketplaceLogo src={`/nft/svgs/marketplaces/${market.toLowerCase()}.svg`} />
                    {MARKETPLACE_ITEMS[market as keyof typeof MARKETPLACE_ITEMS]}
                  </MarketNameWrapper>
                }
                onClick={() => {
                  scrollToTop()
                  removeMarket(market)
                }}
              />
            ))}
            {traits.map((trait) => (
              <TraitChip
                key={trait.trait_value}
                value={
                  trait.trait_type === 'Number of traits'
                    ? `${trait.trait_value} trait${pluralize(Number(trait.trait_value))}`
                    : `${trait.trait_type}: ${trait.trait_value}`
                }
                onClick={() => {
                  scrollToTop()
                  removeTrait(trait)
                }}
              />
            ))}
            {minMaxPriceChipText && (
              <TraitChip
                value={minMaxPriceChipText}
                onClick={() => {
                  scrollToTop()
                  setMin('')
                  setMax('')
                  setPrevMinMax([0, 100])
                }}
              />
            )}
            {Boolean(traits.length || markets.length || minMaxPriceChipText) && (
              <ClearAllButton onClick={handleClearAllClick}>Clear All</ClearAllButton>
            )}
          </Row>
        </InfiniteScrollWrapper>
      </AnimatedBox>
      <InfiniteScrollWrapper>
        <InfiniteScroll
          next={handleNextPageLoad}
          hasMore={hasNext}
          loader={Boolean(hasNext && hasNfts) && <LoadingAssets />}
          dataLength={collectionAssets?.length ?? 0}
          style={{ overflow: 'unset' }}
          className={hasNfts || isLoadingNext ? styles.assetList : undefined}
        >
          {hasNfts ? (
            assets
          ) : collectionAssets?.length === 0 ? (
            <Center width="full" color="textSecondary" textAlign="center" style={{ height: '60vh' }}>
              <EmptyCollectionWrapper>
                <p className={headlineMedium}>No NFTS found</p>
                <Box
                  onClick={reset}
                  type="button"
                  className={clsx(bodySmall, buttonTextMedium)}
                  color="blue"
                  cursor="pointer"
                >
                  <ViewFullCollection>View full collection</ViewFullCollection>
                </Box>
              </EmptyCollectionWrapper>
            </Center>
          ) : (
            <CollectionNftsLoading />
          )}
        </InfiniteScroll>
      </InfiniteScrollWrapper>
    </>
  )
}
