import { Trans } from '@lingui/macro'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useRef } from 'react'
import { ArrowDownCircle, ChevronDown } from 'react-feather'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { useAppSelector } from 'state/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { switchToNetwork } from 'utils/switchToNetwork'

const ActiveRowLinkList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  & > a {
    align-items: center;
    color: ${({ theme }) => theme.text2};
    display: flex;
    flex-direction: row;
    font-size: 16px;
    font-weight: 500;
    justify-content: space-between;
    padding: 8px 4px;
    text-decoration: none;
    margin: 4px 0;
  }
  & > a:first-child {
    margin: 0;
  }
`
const ActiveRowWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
`
const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
  padding: 4px 8px 4px 8px;
`
const FlyoutMenu = styled.div`
  position: fixed;
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  padding: 8px;
  z-index: 99;
  left: 0px;
  position: absolute;
  top: 3rem;
  min-width: 275px;
  height: fit-content;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: unset;
    position: absolute;
    bottom: 4rem;
    left: 1rem;
  `};

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 12px 16px 12px 12px;
  text-align: left;
  width: 100%;

  :hover {
    background-color: ${({ active, theme }) => (active ? theme.bg2 : theme.bg2)};
  }
`
const FlyoutRowActiveIndicator = styled.div`
  background-color: ${({ theme }) => theme.green1};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`
const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
`
const Logo = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 1 auto;
`
const SelectorLabel = styled(NetworkLabel)`
  display: none;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
`
const SelectorControls = styled.div<{ interactive: boolean; color?: string }>`
  align-items: center;
  background-color: ${({ theme, color }) => (color ? color + '20' : theme.bg0)};
  border-radius: 12px;
  color: ${({ theme, color }) => (color ? color : theme.text1)};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 4px 8px;
  height: 38px;
  border: 1px solid transparent;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`
const SelectorLogo = styled(Logo)<{ interactive?: boolean }>`
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
`
const SelectorWrapper = styled.div`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`

const StyledChevronDown = styled(ChevronDown)`
  width: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
     transform: rotate(180deg);

  `};
`
const BridgeText = ({ chainId }: { chainId: SupportedL2ChainId }) => {
  switch (chainId) {
    case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.ARBITRUM_RINKEBY:
      return <Trans>Arbitrum Bridge</Trans>
    case SupportedChainId.OPTIMISM:
    case SupportedChainId.OPTIMISTIC_KOVAN:
      return <Trans>Optimism Gateway</Trans>
    default:
      return <Trans>Bridge</Trans>
  }
}
const ExplorerText = ({ chainId }: { chainId: SupportedL2ChainId }) => {
  switch (chainId) {
    case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.ARBITRUM_RINKEBY:
      return <Trans>Arbitrum Explorer</Trans>
    case SupportedChainId.OPTIMISM:
    case SupportedChainId.OPTIMISTIC_KOVAN:
      return <Trans>Optimistic Etherscan</Trans>
    default:
      return <Trans>Explorer</Trans>
  }
}

export default function NetworkSelector() {
  const { chainId, library } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)
  const implements3085 = useAppSelector((state) => state.application.implements3085)

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const isOnL2 = chainId ? L2_CHAIN_IDS.includes(chainId) : false
  const showSelector = Boolean(implements3085 || isOnL2)
  const mainnetInfo = CHAIN_INFO[SupportedChainId.MAINNET]

  const conditionalToggle = useCallback(() => {
    if (showSelector) {
      toggle()
    }
  }, [showSelector, toggle])

  if (!chainId || !info || !library) {
    return null
  }

  function Row({ targetChain }: { targetChain: number }) {
    if (!library || !chainId || (!implements3085 && targetChain !== chainId)) {
      return null
    }
    const handleRowClick = () => {
      switchToNetwork({ library, chainId: targetChain })
      toggle()
    }
    const active = chainId === targetChain
    const hasExtendedInfo = L2_CHAIN_IDS.includes(targetChain)
    const RowContent = () => (
      <FlyoutRow onClick={handleRowClick} active={active}>
        <Logo src={CHAIN_INFO[targetChain].logoUrl} />
        <NetworkLabel>{CHAIN_INFO[targetChain].label}</NetworkLabel>
        {chainId === targetChain && <FlyoutRowActiveIndicator />}
      </FlyoutRow>
    )
    if (active && hasExtendedInfo) {
      return (
        <ActiveRowWrapper>
          <RowContent />
          <ActiveRowLinkList>
            <ExternalLink href={CHAIN_INFO[targetChain as SupportedL2ChainId].bridge}>
              <BridgeText chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
            <ExternalLink href={CHAIN_INFO[targetChain].explorer}>
              <ExplorerText chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
            <ExternalLink
              href="https://help.uniswap.org/en/collections/3033942-layer-2
https://help.uniswap.org/en/collections/3033942-layer-2"
            >
              <Trans>Help & Guides</Trans> <LinkOutCircle />
            </ExternalLink>
          </ActiveRowLinkList>
        </ActiveRowWrapper>
      )
    }
    return <RowContent />
  }

  return (
    <SelectorWrapper ref={node as any}>
      <SelectorControls color={info.color} onClick={conditionalToggle} interactive={showSelector}>
        <SelectorLogo interactive={showSelector} src={info.logoUrl || mainnetInfo.logoUrl} />
        <SelectorLabel>{info.shortLabel ? info.shortLabel : info.label}</SelectorLabel>
        {showSelector && <StyledChevronDown />}
      </SelectorControls>
      {open && (
        <FlyoutMenu>
          <FlyoutHeader>
            <Trans>Select a network</Trans>
          </FlyoutHeader>
          <Row targetChain={SupportedChainId.MAINNET} />
          <Row targetChain={SupportedChainId.OPTIMISM} />
          <Row targetChain={SupportedChainId.ARBITRUM_ONE} />
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
