import { Trans } from '@lingui/macro'
import {
  ArbitrumWrapperBackgroundDarkMode,
  ArbitrumWrapperBackgroundLightMode,
  OptimismWrapperBackgroundDarkMode,
  OptimismWrapperBackgroundLightMode,
} from 'components/NetworkAlert/NetworkAlert'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { ArrowDownCircle } from 'react-feather'
import { useArbitrumAlphaAlert, useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { ReadMoreLink } from './styles'

const L2Icon = styled.img`
  display: none;
  height: 40px;
  margin: auto 20px auto 4px;
  width: 40px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToMedium}px) {
    display: block;
  }
`
const Wrapper = styled.div<{ chainId: SupportedL2ChainId; darkMode: boolean; logoUrl: string }>`
  ${({ chainId, darkMode }) =>
    [SupportedChainId.OPTIMISM, SupportedChainId.OPTIMISTIC_KOVAN].includes(chainId)
      ? darkMode
        ? OptimismWrapperBackgroundDarkMode
        : OptimismWrapperBackgroundLightMode
      : darkMode
      ? ArbitrumWrapperBackgroundDarkMode
      : ArbitrumWrapperBackgroundLightMode};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  max-width: 880px;
  overflow: hidden;
  padding: 12px;
  position: relative;
  width: 100%;

  :before {
    background-image: url(${({ logoUrl }) => logoUrl});
    background-repeat: no-repeat;
    background-size: 300px;
    content: '';
    height: 300px;
    opacity: 0.1;
    position: absolute;
    transform: rotate(25deg) translate(-90px, -40px);
    width: 300px;
    z-index: -1;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToMedium}px) {
    flex-direction: row;
    padding: 16px 20px;
  }
`
const Body = styled.div`
  font-size: 12px;
  line-height: 143%;
  margin: 12px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToMedium}px) {
    flex: 1 1 auto;
    margin: auto 0;
  }
`
const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 20px;
  height: 20px;
  margin-left: 12px;
`
const LinkOutToBridge = styled(ExternalLink)`
  align-items: center;
  background-color: black;
  border-radius: 16px;
  color: white;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin: 0;
  max-height: 47px;
  padding: 16px 12px;
  text-decoration: none;
  width: auto;
  :hover,
  :focus,
  :active {
    background-color: black;
  }
  @media screen and (min-width: ${MEDIA_WIDTHS.upToMedium}px) {
    margin: auto 0 auto 12px;
    padding: 14px 16px;
    min-width: 226px;
  }
`
export function AddLiquidityNetworkAlert() {
  const { chainId } = useActiveWeb3React()
  const [darkMode] = useDarkModeManager()
  const [arbitrumAlphaAcknowledged] = useArbitrumAlphaAlert()

  if (!chainId || !L2_CHAIN_IDS.includes(chainId) || arbitrumAlphaAcknowledged) {
    return null
  }
  const info = CHAIN_INFO[chainId as SupportedL2ChainId]
  const depositUrl = [SupportedChainId.OPTIMISM, SupportedChainId.OPTIMISTIC_KOVAN].includes(chainId)
    ? `${info.bridge}?chainId=1`
    : info.bridge
  return (
    <Wrapper darkMode={darkMode} chainId={chainId} logoUrl={info.logoUrl}>
      <L2Icon src={info.logoUrl} />
      <Body>
        <Trans>
          Uniswap is now live on the Optimistic Ethereum (OΞ) network. Trade with low fees and nearly instant
          transaction times on Layer 2. To get started, deposit assets from Ethereum to OΞ.
        </Trans>{' '}
        <ReadMoreLink href="https://help.uniswap.org/en/collections/3033942-layer-2">
          <Trans>Learn how</Trans>
        </ReadMoreLink>
      </Body>
      <LinkOutToBridge href={depositUrl}>
        <Trans>Deposit to {info.label}</Trans>
        <LinkOutCircle />
      </LinkOutToBridge>
    </Wrapper>
  )
}
