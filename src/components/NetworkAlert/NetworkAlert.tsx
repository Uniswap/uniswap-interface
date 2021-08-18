import { Trans } from '@lingui/macro'
import { L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useState } from 'react'
import { ArrowDownCircle, X } from 'react-feather'
import { useArbitrumAlphaAlert, useDarkModeManager, useOptimismAlphaAlert } from 'state/user/hooks'
import { useETHBalances } from 'state/wallet/hooks'
import styled, { css } from 'styled-components/macro'
import { ExternalLink, HideSmall } from 'theme'
import { CHAIN_INFO } from '../../constants/chains'
import { ReadMoreLink } from './styles'

const CloseIcon = styled(X)`
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0.6;

  :hover {
    opacity: 1;
  }
`

export const ArbitrumWrapperBackgroundDarkMode = css`
  background: radial-gradient(285% 8200% at 30% 50%, rgba(40, 160, 240, 0.1) 0%, rgba(219, 255, 0, 0) 100%),
    radial-gradient(75% 75% at 0% 0%, rgba(150, 190, 220, 0.3) 0%, rgba(33, 114, 229, 0.3) 100%), hsla(0, 0%, 100%, 0.1);
`
export const ArbitrumWrapperBackgroundLightMode = css`
  background: radial-gradient(285% 8200% at 30% 50%, rgba(40, 160, 240, 0.1) 0%, rgba(219, 255, 0, 0) 100%),
    radial-gradient(circle at top left, hsla(206, 50%, 75%, 0.01), hsla(215, 79%, 51%, 0.12)), hsla(0, 0%, 100%, 0.1);
`
export const OptimismWrapperBackgroundDarkMode = css`
  background: radial-gradient(948% 292% at 42% 0%, rgba(255, 58, 212, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%),
    radial-gradient(98% 96% at 2% 0%, rgba(255, 39, 39, 0.2) 0%, rgba(235, 0, 255, 0.2) 96%);
`
export const OptimismWrapperBackgroundLightMode = css`
  background: radial-gradient(92% 105% at 50% 7%, rgba(255, 58, 212, 0.04) 0%, rgba(255, 255, 255, 0.03) 100%),
    radial-gradient(100% 97% at 0% 12%, rgba(236, 162, 243, 0.2) 0%, rgba(243, 19, 19, 0.2) 100%),
    hsla(0, 0%, 100%, 0.5);
`
const RootWrapper = styled.div<{ chainId: SupportedChainId; darkMode: boolean; logoUrl: string; wide: boolean }>`
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
  flex-direction: ${({ wide }) => (wide ? 'row' : 'column')};
  max-width: ${({ wide }) => (wide ? '880px' : '480px')};
  overflow: hidden;
  position: relative;
  width: 100%;
  padding: 1.25rem;
  margin-bottom: 12px;

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
`
const Header = styled.h1`
  margin: 0rem 0 1rem 0rem;
  font-size: 1.5rem;
  margin-right: 48px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 1.25rem;
    margin-right: 24px;
  `};
`

const Body = styled.div`
  font-size: 16px;
  line-height: 143%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Copy = styled.div<{ wide: boolean }>`
  margin: ${({ wide }) => (wide ? '0 1rem 0.5rem 0' : '0 0 0.5rem 0')};
`

const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 20px;
  height: 20px;
`
const LinkOutToBridge = styled(ExternalLink)<{ darkMode: boolean }>`
  align-items: center;
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ darkMode }) => (darkMode ? `rgba(255, 255, 255, 0.1)` : `rgba(0, 0, 0, 0.05)`)};
  border: 1px solid ${({ darkMode }) => (darkMode ? `rgba(255, 255, 255, 0.2 )` : `rgba(0, 0, 0, 0.2)`)};

  display: flex;
  font-size: 16px;
  height: 44px;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px 16px;
  text-decoration: none;
  width: auto;

  :hover,
  :focus,
  :active {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    text-decoration: none !important;
  }
`
export function NetworkAlert({ wide }: { wide: boolean }) {
  const { account, chainId } = useActiveWeb3React()
  const [darkMode] = useDarkModeManager()
  const [arbitrumAlphaAcknowledged, setArbitrumAlphaAcknowledged] = useArbitrumAlphaAlert()
  const [optimismAlphaAcknowledged, setOptimismAlphaAcknowledged] = useOptimismAlphaAlert()
  const [locallyDismissed, setLocallyDimissed] = useState(false)
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  const dismiss = useCallback(() => {
    if (userEthBalance?.greaterThan(0)) {
      switch (chainId) {
        case SupportedChainId.OPTIMISM:
          setOptimismAlphaAcknowledged(true)
          break
        case SupportedChainId.ARBITRUM_ONE:
          setArbitrumAlphaAcknowledged(true)
          break
      }
    } else {
      setLocallyDimissed(true)
    }
  }, [chainId, setArbitrumAlphaAcknowledged, setOptimismAlphaAcknowledged, userEthBalance])

  const onOptimismAndOptimismAcknowledged = SupportedChainId.OPTIMISM === chainId && optimismAlphaAcknowledged
  const onArbitrumAndArbitrumAcknowledged = SupportedChainId.ARBITRUM_ONE === chainId && arbitrumAlphaAcknowledged
  if (
    !chainId ||
    !L2_CHAIN_IDS.includes(chainId) ||
    onArbitrumAndArbitrumAcknowledged ||
    onOptimismAndOptimismAcknowledged ||
    locallyDismissed
  ) {
    return null
  }
  const info = CHAIN_INFO[chainId as SupportedL2ChainId]
  const depositUrl = [SupportedChainId.OPTIMISM, SupportedChainId.OPTIMISTIC_KOVAN].includes(chainId)
    ? `${info.bridge}?chainId=1`
    : info.bridge

  return (
    <RootWrapper wide={wide} chainId={chainId} darkMode={darkMode} logoUrl={info.logoUrl}>
      <CloseIcon onClick={dismiss} />
      <Header>Welcome to Uniswap on {info.label}.</Header>
      <Body>
        <Copy wide={wide}>
          <Trans>
            Trade with low fees and nearly instant transaction times. To get started, deposit assets from Ethereum to{' '}
            {info.shortLabel}.
          </Trans>
          <ReadMoreLink href="https://help.uniswap.org/en/articles/5392809-how-to-deposit-tokens-to-optimism">
            <Trans>Learn how</Trans>
          </ReadMoreLink>
        </Copy>
        <LinkOutToBridge darkMode={darkMode} href={depositUrl}>
          <span>
            <Trans>
              Deposit to <HideSmall>{info.label}</HideSmall>
              {info.shortLabel ? ` (${info.shortLabel})` : ''}
            </Trans>
          </span>
          <LinkOutCircle />
        </LinkOutToBridge>
      </Body>
    </RootWrapper>
  )
}
