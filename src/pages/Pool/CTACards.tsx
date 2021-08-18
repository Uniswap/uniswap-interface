import { Trans } from '@lingui/macro'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { CHAIN_INFO, SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'
import { ExternalLink, HideSmall } from '../../theme'

const CTASection = styled.section`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: auto;
    grid-template-rows: auto;
  `};
`

const CTA1 = styled(ExternalLink)`
  background-color: ${({ theme }) => theme.bg0};
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.bg2};

  * {
    color: ${({ theme }) => theme.text1};
    text-decoration: none !important;
  }

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => theme.bg3};
    text-decoration: none;
    * {
      text-decoration: none !important;
    }
  }
`

const TopArrow = styled.span`
  font-weight: 300;
  opacity: 0.2;
  font-size: 36px;
  height: 24px;
  line-height: 32px;
`

const HeaderText = styled(TYPE.main)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-weight: 300;
  font-size: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 20px;
  `};
`

export default function CTACards() {
  const { chainId } = useActiveWeb3React()
  const { infoLink } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]
  return (
    <div>
      <HideSmall>
        <NetworkAlert wide={true} />
      </HideSmall>
      <CTASection>
        <CTA1 href={'https://help.uniswap.org/en/articles/5391541-providing-liquidity-on-uniswap-v3'}>
          <HeaderText>
            <Trans>Learn about providing liquidity</Trans> <TopArrow>↗</TopArrow>
          </HeaderText>
          <TYPE.body fontWeight={300} mt={2}>
            <Trans>Check out our v3 LP walkthrough and migration guides.</Trans>
          </TYPE.body>
        </CTA1>
        <HideSmall>
          <CTA1 href={infoLink + 'pools'}>
            <HeaderText>
              <Trans>Top pools</Trans>
              <TopArrow>↗</TopArrow>
            </HeaderText>
            <TYPE.body fontWeight={300} mt={2}>
              <Trans>Explore popular pools.</Trans>
            </TYPE.body>
          </CTA1>
        </HideSmall>
      </CTASection>
    </div>
  )
}
