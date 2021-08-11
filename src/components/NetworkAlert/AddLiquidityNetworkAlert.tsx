import { Trans } from '@lingui/macro'
import {
  ArbitrumWrapperBackgroundDarkMode,
  ArbitrumWrapperBackgroundLightMode,
  OptimismWrapperBackgroundDarkMode,
  OptimismWrapperBackgroundLightMode,
} from 'components/NetworkAlert/NetworkAlert'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { useArbitrumAlphaAlert, useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
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
  flex-wrap: wrap;
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
  font-size: 16px;
  line-height: 143%;
  margin: 12px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToMedium}px) {
    flex: 1 1 auto;
    margin: auto 0;
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

  return (
    <Wrapper darkMode={darkMode} chainId={chainId} logoUrl={info.logoUrl}>
      <span style={{ display: 'flex' }}>
        <L2Icon src={info.logoUrl} />
        <Body>
          <Trans>
            {`You're adding liquidity using the ${info.label} L2 network. Make sure you have assets on the correct network.`}{' '}
            <ReadMoreLink href="https://help.uniswap.org/en/articles/5392809-how-to-deposit-tokens-to-optimism">
              <Trans>Learn how</Trans>
            </ReadMoreLink>
            {` to deposit assets from Ethereum to ${info.shortLabel}.`}
          </Trans>{' '}
        </Body>
      </span>
    </Wrapper>
  )
}
