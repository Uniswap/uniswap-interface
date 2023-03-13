import * as Card from 'nft/components/card/containers'
import { GenieAsset, UniformAspectRatio, UniformAspectRatios, WalletAsset } from 'nft/types'
import { floorFormatter, isAudio, isVideo } from 'nft/utils'
import { ReactNode, useCallback } from 'react'

enum AssetMediaType {
  Image,
  Video,
  Audio,
}

function getAssetImageUrl(asset: GenieAsset | WalletAsset) {
  return asset.imageUrl || asset.smallImageUrl
}

function getAssetMediaUrl(asset: GenieAsset | WalletAsset) {
  return asset.animationUrl
}

function detailsHref(asset: GenieAsset | WalletAsset) {
  if ('address' in asset) return `/nfts/asset/${asset.address}/${asset.tokenId}?origin=collection`
  if ('asset_contract' in asset) return `/nfts/asset/${asset.asset_contract.address}/${asset.tokenId}?origin=profile`
  return '/nfts/profile'
}

function getAssetMediaType(asset: GenieAsset | WalletAsset) {
  let assetMediaType = AssetMediaType.Image
  if (asset.animationUrl) {
    if (isAudio(asset.animationUrl)) {
      assetMediaType = AssetMediaType.Audio
    } else if (isVideo(asset.animationUrl)) {
      assetMediaType = AssetMediaType.Video
    }
  }
  return assetMediaType
}

function getNftDisplayComponent(
  asset: GenieAsset | WalletAsset,
  mediaShouldBePlaying: boolean,
  setCurrentTokenPlayingMedia: (tokenId: string | undefined) => void,
  uniformAspectRatio?: UniformAspectRatio,
  setUniformAspectRatio?: (uniformAspectRatio: UniformAspectRatio) => void,
  renderedHeight?: number,
  setRenderedHeight?: (renderedHeight: number | undefined) => void
) {
  switch (getAssetMediaType(asset)) {
    case AssetMediaType.Image:
      return (
        <Card.Image
          src={getAssetImageUrl(asset)}
          uniformAspectRatio={uniformAspectRatio}
          setUniformAspectRatio={setUniformAspectRatio}
          renderedHeight={renderedHeight}
          setRenderedHeight={setRenderedHeight}
        />
      )
    case AssetMediaType.Video:
      return (
        <Card.Video
          src={getAssetImageUrl(asset)}
          mediaSrc={getAssetMediaUrl(asset)}
          tokenId={asset.tokenId}
          shouldPlay={mediaShouldBePlaying}
          setCurrentTokenPlayingMedia={setCurrentTokenPlayingMedia}
          uniformAspectRatio={uniformAspectRatio}
          setUniformAspectRatio={setUniformAspectRatio}
          renderedHeight={renderedHeight}
          setRenderedHeight={setRenderedHeight}
        />
      )
    case AssetMediaType.Audio:
      return (
        <Card.Audio
          src={getAssetImageUrl(asset)}
          mediaSrc={getAssetMediaUrl(asset)}
          tokenId={asset.tokenId}
          shouldPlay={mediaShouldBePlaying}
          setCurrentTokenPlayingMedia={setCurrentTokenPlayingMedia}
          uniformAspectRatio={uniformAspectRatio}
          setUniformAspectRatio={setUniformAspectRatio}
          renderedHeight={renderedHeight}
          setRenderedHeight={setRenderedHeight}
        />
      )
  }
}

function useSelectAsset(
  selectAsset: () => void,
  unselectAsset: () => void,
  isSelected: boolean,
  isDisabled: boolean,
  onClick?: () => void
) {
  return useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (isDisabled) {
        return
      }

      if (onClick) {
        onClick()
        return
      }

      return isSelected ? unselectAsset() : selectAsset()
    },
    [selectAsset, isDisabled, onClick, unselectAsset, isSelected]
  )
}

interface NftCardProps {
  asset: GenieAsset | WalletAsset
  display: NftCardDisplayProps
  isSelected: boolean
  isDisabled: boolean
  selectAsset: () => void
  unselectAsset: () => void
  onClick?: () => void
  doNotLinkToDetails?: boolean
  mediaShouldBePlaying: boolean
  uniformAspectRatio?: UniformAspectRatio
  setUniformAspectRatio?: (uniformAspectRatio: UniformAspectRatio) => void
  renderedHeight?: number
  setRenderedHeight?: (renderedHeight: number | undefined) => void
  setCurrentTokenPlayingMedia: (tokenId: string | undefined) => void
  testId?: string
}

export interface NftCardDisplayProps {
  primaryInfo?: ReactNode
  primaryInfoIcon?: ReactNode
  primaryInfoRight?: ReactNode
  secondaryInfo?: ReactNode
  selectedInfo?: ReactNode
  notSelectedInfo?: ReactNode
  disabledInfo?: ReactNode
}

export const NftCard = ({
  asset,
  display,
  isSelected,
  selectAsset,
  unselectAsset,
  isDisabled,
  onClick,
  doNotLinkToDetails = false,
  mediaShouldBePlaying,
  uniformAspectRatio = UniformAspectRatios.square,
  setUniformAspectRatio,
  renderedHeight,
  setRenderedHeight,
  setCurrentTokenPlayingMedia,
  testId,
}: NftCardProps) => {
  const clickActionButton = useSelectAsset(selectAsset, unselectAsset, isSelected, isDisabled, onClick)

  const collectionNft = 'marketplace' in asset
  const profileNft = 'asset_contract' in asset
  const tokenType = collectionNft ? asset.tokenType : profileNft ? asset.asset_contract.tokenType : undefined
  const marketplace = collectionNft ? asset.marketplace : undefined
  const listedPrice =
    profileNft && !isDisabled && asset.floor_sell_order_price ? floorFormatter(asset.floor_sell_order_price) : undefined

  return (
    <Card.Container
      isSelected={isSelected}
      isDisabled={isDisabled}
      detailsHref={detailsHref(asset)}
      doNotLinkToDetails={doNotLinkToDetails}
      testId={testId}
    >
      <Card.ImageContainer isDisabled={isDisabled}>
        <Card.MarketplaceContainer
          isSelected={isSelected}
          marketplace={marketplace}
          tokenType={tokenType}
          listedPrice={listedPrice}
        />
        {getNftDisplayComponent(
          asset,
          mediaShouldBePlaying,
          setCurrentTokenPlayingMedia,
          uniformAspectRatio,
          setUniformAspectRatio,
          renderedHeight,
          setRenderedHeight
        )}
      </Card.ImageContainer>
      <Card.DetailsRelativeContainer>
        <Card.DetailsContainer>
          <Card.InfoContainer>
            <Card.PrimaryRow>
              <Card.PrimaryDetails>
                <Card.PrimaryInfo>{display.primaryInfo}</Card.PrimaryInfo>
                {display.primaryInfoIcon}
              </Card.PrimaryDetails>
              {display.primaryInfoRight}
            </Card.PrimaryRow>
            <Card.SecondaryRow>
              <Card.SecondaryDetails>
                <Card.SecondaryInfo>{display.secondaryInfo}</Card.SecondaryInfo>
              </Card.SecondaryDetails>
            </Card.SecondaryRow>
          </Card.InfoContainer>
        </Card.DetailsContainer>
      </Card.DetailsRelativeContainer>
      <Card.ActionButton clickActionButton={clickActionButton} isDisabled={isDisabled} isSelected={isSelected}>
        {isSelected ? display.selectedInfo : isDisabled ? display.disabledInfo : display.notSelectedInfo}
      </Card.ActionButton>
    </Card.Container>
  )
}
