import React, { memo, useCallback } from 'react'
import { ViewProps } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { SharedValue } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { useTokenDetailsNavigation } from 'src/components/TokenDetails/hooks'
import RemoveButton from 'src/components/explore/RemoveButton'
import { useAnimatedCardDragStyle, useExploreTokenContextMenu } from 'src/components/explore/hooks'
import { Loader } from 'src/components/loading/loaders'
import { disableOnPress } from 'src/utils/disableOnPress'
import { usePollOnFocusOnly } from 'src/utils/hooks'
import { AnimatedTouchableArea, Flex, Text, useIsDarkMode, useShadowPropsShort, useSporeColors } from 'ui/src'
import { AnimatedFlex } from 'ui/src/components/layout/AnimatedFlex'
import { borderRadii, imageSizes, opacify } from 'ui/src/theme'
import { TokenLogo } from 'uniswap/src/components/CurrencyLogo/TokenLogo'
import { PollingInterval } from 'uniswap/src/constants/misc'
import { useFavoriteTokenCardQuery } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { useEnabledChains } from 'uniswap/src/features/chains/hooks/useEnabledChains'
import { fromGraphQLChain } from 'uniswap/src/features/chains/utils'
import { currencyIdToContractInput } from 'uniswap/src/features/dataApi/utils'
import { removeFavoriteToken } from 'uniswap/src/features/favorites/slice'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { SectionName } from 'uniswap/src/features/telemetry/constants'
import { getSymbolDisplayText } from 'uniswap/src/utils/currency'
import { NumberType } from 'utilities/src/format/types'
import { RelativeChange } from 'wallet/src/components/text/RelativeChange'
import { isNonPollingRequestInFlight } from 'wallet/src/data/utils'

export const FAVORITE_TOKEN_CARD_LOADER_HEIGHT = 114

export type FavoriteTokenCardProps = {
  currencyId: string
  pressProgress: SharedValue<number>
  dragActivationProgress: SharedValue<number>
  isEditing?: boolean
  setIsEditing: (update: boolean) => void
} & ViewProps

function FavoriteTokenCard({
  currencyId,
  isEditing,
  pressProgress,
  dragActivationProgress,
  setIsEditing,
  ...rest
}: FavoriteTokenCardProps): JSX.Element {
  const dispatch = useDispatch()
  const { defaultChainId } = useEnabledChains()
  const tokenDetailsNavigation = useTokenDetailsNavigation()
  const { convertFiatAmountFormatted } = useLocalizationContext()

  const colors = useSporeColors()
  const isDarkMode = useIsDarkMode()

  const { data, networkStatus, startPolling, stopPolling } = useFavoriteTokenCardQuery({
    variables: currencyIdToContractInput(currencyId),
    // Rely on cache for fast favoriting UX, and poll for updates.
    fetchPolicy: 'cache-and-network',
    returnPartialData: true,
  })

  usePollOnFocusOnly(startPolling, stopPolling, PollingInterval.Fast)

  const token = data?.token

  // Mirror behavior in top tokens list, use first chain the token is on for the symbol
  const chainId = fromGraphQLChain(token?.chain) ?? defaultChainId

  const price = convertFiatAmountFormatted(token?.market?.price?.value, NumberType.FiatTokenPrice)
  const pricePercentChange = token?.market?.pricePercentChange?.value

  const onRemove = useCallback(() => {
    if (currencyId) {
      dispatch(removeFavoriteToken({ currencyId }))
    }
  }, [currencyId, dispatch])

  const onEditFavorites = useCallback(() => {
    setIsEditing(true)
  }, [setIsEditing])

  const { menuActions, onContextMenuPress } = useExploreTokenContextMenu({
    chainId,
    currencyId,
    analyticsSection: SectionName.ExploreFavoriteTokensSection,
    onEditFavorites,
  })

  const onPress = (): void => {
    if (isEditing || !currencyId) {
      return
    }
    tokenDetailsNavigation.preload(currencyId)
    tokenDetailsNavigation.navigate(currencyId)
  }

  const animatedDragStyle = useAnimatedCardDragStyle(pressProgress, dragActivationProgress)

  const shadowProps = useShadowPropsShort()

  if (isNonPollingRequestInFlight(networkStatus)) {
    return <Loader.Favorite height={FAVORITE_TOKEN_CARD_LOADER_HEIGHT} />
  }

  return (
    <AnimatedFlex borderRadius="$rounded16" style={animatedDragStyle}>
      <ContextMenu
        actions={menuActions}
        disabled={isEditing}
        style={{ borderRadius: borderRadii.rounded16 }}
        onPress={onContextMenuPress}
        {...rest}
      >
        <AnimatedTouchableArea
          activeOpacity={isEditing ? 1 : undefined}
          backgroundColor={isDarkMode ? '$surface2' : '$surface1'}
          borderColor={opacify(0.05, colors.surface3.val)}
          borderRadius="$rounded16"
          borderWidth={isDarkMode ? '$none' : '$spacing1'}
          m="$spacing4"
          testID={`token-box-${token?.symbol}`}
          onLongPress={disableOnPress}
          onPress={onPress}
          {...shadowProps}
        >
          <Flex alignItems="flex-start" gap="$spacing8" p="$spacing12">
            <Flex row gap="$spacing4" justifyContent="space-between">
              <Flex grow row alignItems="center" gap="$spacing8">
                <TokenLogo
                  chainId={chainId ?? undefined}
                  name={token?.name ?? undefined}
                  size={imageSizes.image20}
                  symbol={token?.symbol ?? undefined}
                  url={token?.project?.logoUrl ?? undefined}
                />
                <Text variant="body1">{getSymbolDisplayText(token?.symbol)}</Text>
              </Flex>
              <RemoveButton visible={isEditing} onPress={onRemove} />
            </Flex>
            <Flex gap="$spacing2">
              <Text adjustsFontSizeToFit numberOfLines={1} variant="heading3">
                {price}
              </Text>
              <RelativeChange
                arrowSize="$icon.16"
                change={pricePercentChange ?? undefined}
                semanticColor={true}
                variant="subheading2"
              />
            </Flex>
          </Flex>
        </AnimatedTouchableArea>
      </ContextMenu>
    </AnimatedFlex>
  )
}

export default memo(FavoriteTokenCard)
