import { prefetchColor } from 'lib/hooks/useColor'
import { DAI, ETH, UNI, USDC } from 'lib/mocks'
import styled, { icon, Theme } from 'lib/theme'
import TYPE from 'lib/theme/type'
import { Token } from 'lib/types'
import { transparentize } from 'polished'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'react-feather'

import Button from './Button'
import Column from './Column'
import Dialog, { Header } from './Dialog'
import { StringInput } from './Input'
import Row from './Row'
import Rule from './Rule'

// TODO: integrate with web3-react context
const mockTokens = [DAI, ETH, UNI, USDC]

const SearchInput = styled(StringInput)`
  background-color: ${({ theme }) => theme.container};
  border-radius: ${({ theme }) => (theme.borderRadius ? theme.borderRadius + 0.25 : 0)}em;
  height: unset;
  padding: 0.75em;

  :focus-within {
    outline: 1px solid ${({ theme }) => theme.active};
  }
`

const TokenButton = styled(Button)`
  border-radius: ${({ theme }) => theme.borderRadius}em;
  padding: 0.25em;

  :hover {
    background-color: ${({ theme }) => transparentize(0.3, theme.interactive)};
    opacity: 1;
  }
`

const OptionTokenButton = styled(TokenButton)<{ empty?: boolean; theme: Theme }>`
  background-color: ${({ empty, theme }) => (empty ? theme.accent : theme.interactive)};
  padding-left: ${({ empty }) => (empty ? 0.75 : 0.25)}em;

  :hover {
    background-color: ${({ empty, theme }) => transparentize(0.3, empty ? theme.accent : theme.interactive)};
    opacity: 1;
  }
`

const BaseTokenButton = styled(TokenButton)`
  background-color: ${({ theme }) => theme.container};
  padding-right: 0.75em;
`

const RowTokenButton = styled(TokenButton)`
  border-radius: 0;
  outline: none;
  padding: 0.5em 1em 0.5em 1.25em;

  :first-of-type {
    padding-top: 1em;
  }

  :hover {
    background-color: inherit;
  }

  :focus {
    background-color: ${({ theme }) => transparentize(0.3, theme.interactive)};
  }
`

const TokenButtonRow = styled(Row)`
  height: 1.2em;
`

const TokenImg = styled.img<{ disabled?: boolean }>`
  border-radius: 100%;
  filter: ${({ disabled }) => disabled && 'saturate(0) opacity(0.6)'};
  height: 1.2em;
  width: 1.2em;
`

const ChevronDownIcon = styled(icon(ChevronDown, { color: 'contrast' }))`
  stroke-width: 3;
`

interface TokenOptionProps {
  value?: Token
  disabled?: boolean
  onClick: () => void
}

function TokenOption({ value, disabled, onClick }: TokenOptionProps) {
  return (
    <OptionTokenButton onClick={onClick} empty={!value}>
      <TYPE.buttonLarge color="contrast">
        <TokenButtonRow gap={0.5}>
          {value ? (
            <>
              <TokenImg src={value.logoURI} alt={`${value.name || value.symbol} logo`} disabled={disabled} />
              {value.symbol}
            </>
          ) : (
            'Select a token'
          )}
          <ChevronDownIcon />
        </TokenButtonRow>
      </TYPE.buttonLarge>
    </OptionTokenButton>
  )
}

interface TokenButtonProps {
  value: Token
  onClick: (value: Token) => void
}

function BaseToken({ value, onClick }: TokenButtonProps) {
  return (
    <BaseTokenButton onClick={() => onClick(value)} onMouseDown={() => prefetchColor(value)}>
      <TYPE.buttonMedium>
        <TokenButtonRow gap={0.5}>
          <TokenImg src={value.logoURI} alt={`${value.name || value.symbol} logo`} />
          {value.symbol}
        </TokenButtonRow>
      </TYPE.buttonMedium>
    </BaseTokenButton>
  )
}

function RowToken({ value, onClick }: TokenButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const current = ref.current
    const focus = () => current?.focus({ preventScroll: true })
    const tab = (e: KeyboardEvent) => {
      const prev = current?.previousElementSibling as HTMLElement | null
      const next = current?.nextElementSibling as HTMLElement | null
      if (e.key === 'ArrowUp') {
        prev?.focus()
      } else if (e.key === 'ArrowDown') {
        next?.focus()
      }
    }
    current?.addEventListener('mousemove', focus)
    current?.addEventListener('keydown', tab)
    return () => {
      current?.removeEventListener('mouseover', focus)
      current?.removeEventListener('keydown', tab)
    }
  })
  return (
    <RowTokenButton onClick={() => onClick(value)} onMouseDown={() => prefetchColor(value)} ref={ref}>
      <TYPE.body1>
        <Row justify="flex-start" gap={0.5} style={{ gridTemplateColumns: '1.25em 1fr' }}>
          <TokenImg src={value.logoURI} alt={`${value.name || value.symbol} logo`} />
          <Row justify="space-between">
            <Column flex align="flex-start">
              <TYPE.subhead1>{value.symbol}</TYPE.subhead1>
              <TYPE.caption color="secondary">{value.name}</TYPE.caption>
            </Column>
            1.234
          </Row>
        </Row>
      </TYPE.body1>
    </RowTokenButton>
  )
}

interface TokenSelectDialogProps {
  onChange: (token: Token) => void
}

export function TokenSelectDialog({ onChange }: TokenSelectDialogProps) {
  const baseTokens = mockTokens
  const tokens = mockTokens

  const [search, setSearch] = useState('')
  const onSelect = useCallback(
    (token: Token) => {
      onChange(token)
    },
    [onChange]
  )

  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [input])

  return (
    <>
      <Column gap={0.75}>
        <Header title="Select a token" />
        <Row padded grow>
          <TYPE.body1 color={search ? 'primary' : 'secondary'}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by token name or address"
              ref={input}
            />
          </TYPE.body1>
        </Row>
        {baseTokens && (
          <>
            <Row gap={0.25} justify="flex-start" flex padded>
              {baseTokens.map((token) => (
                <BaseToken value={token} onClick={onSelect} key={token.address} />
              ))}
            </Row>
            <Rule padded />
          </>
        )}
      </Column>
      <Column scrollable>
        {tokens && tokens.map((token) => <RowToken value={token} onClick={onSelect} key={token.address} />)}
      </Column>
    </>
  )
}

interface TokenSelectProps {
  value?: Token
  disabled?: boolean
  onChange: (value: Token) => void
}

export default function TokenSelect({ value, disabled, onChange }: TokenSelectProps) {
  const [open, setOpen] = useState(false)
  const onSelect = useCallback(
    (value: Token) => {
      onChange(value)
      setOpen(false)
    },
    [onChange, setOpen]
  )
  return (
    <>
      <TokenOption value={value} disabled={disabled} onClick={() => setOpen(true)} />
      {open && (
        <Dialog color="module" onClose={() => setOpen(false)}>
          <TokenSelectDialog onChange={onSelect} />
        </Dialog>
      )}
    </>
  )
}
