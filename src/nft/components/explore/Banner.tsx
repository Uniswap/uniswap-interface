import { useIsMobile } from 'nft/hooks'
import { fetchTrendingCollections } from 'nft/queries'
import { TimePeriod } from 'nft/types'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Carousel } from './Carousel'
import { CarouselCard } from './CarouselCard'

const BannerContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 320px;
  margin-top: 24px;
  gap: 36px;
  max-width: 1200px;
  justify-content: space-between;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex-direction: column;
    height: 100%;
    gap: 14px;
    margin-top: 4px;
    margin-bottom: 30px;
  }
`

const HeaderContainer = styled.div`
  display: flex;
  max-width: 500px;
  font-weight: 500;
  font-size: 60px;
  line-height: 73px;
  justify-content: start;
  align-items: start;
  padding-top: 40px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%), #fc72ff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.lg}px`}) {
    font-size: 48px;
    line-height: 67px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    font-size: 36px;
    line-height: 50px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    font-size: 20px;
    line-height: 28px;
    justify-content: center;
    align-items: center;
    padding-top: 0px;
  }
`

const Banner = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const { data: collections } = useQuery(
    ['trendingCollections'],
    () => {
      return fetchTrendingCollections({ volumeType: 'eth', timePeriod: TimePeriod.OneDay, size: 5 })
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  )

  return (
    <BannerContainer>
      <HeaderContainer>
        Best price. {!isMobile && <br />}
        Every listing.
      </HeaderContainer>
      {collections ? (
        <>
          {isMobile ? (
            <CarouselCard
              key={collections[0].address}
              collection={collections[0]}
              onClick={() => navigate(`/nfts/collection/${collections[0].address}`)}
            />
          ) : (
            <Carousel>
              {collections.map((collection) => (
                <CarouselCard
                  key={collection.address}
                  collection={collection}
                  onClick={() => navigate(`/nfts/collection/${collection.address}`)}
                />
              ))}
            </Carousel>
          )}
        </>
      ) : (
        <>
          {/* TODO: Improve Loading State */}
          <p>Loading</p>
        </>
      )}
    </BannerContainer>
  )
}

export default Banner
