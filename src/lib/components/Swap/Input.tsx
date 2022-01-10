import { Trans } from '@lingui/macro'
import { auto } from '@popperjs/core'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useAtomValue } from 'jotai/utils'
import JSBI from 'jsbi'
import Popover from 'lib/components/Popover'
import { inputAtom, useUpdateInputToken, useUpdateInputValue } from 'lib/state/swap'
import styled, { ThemedText } from 'lib/theme'
import { useState } from 'react'

import Column from '../Column'
import Row from '../Row'
import TokenImg from '../TokenImg'
import TokenInput from './TokenInput'

const mockAmount = JSBI.BigInt(134108514895957704114061)
console.log(mockAmount)
const mockToken = new Token(1, '0x8b3192f5eebd8579568a2ed41e6feb402f93f73f', 9, 'STM', 'Saitama')
const mockCurrencyAmount = CurrencyAmount.fromRawAmount(mockToken, mockAmount)

const InputColumn = styled(Column)<{ approved?: boolean }>`
  margin: 0.75em;
  position: relative;

  ${TokenImg} {
    filter: ${({ approved }) => (approved ? undefined : 'saturate(0) opacity(0.4)')};
    transition: filter 0.25s;
  }
`

interface InputProps {
  disabled?: boolean
}

export default function Input({ disabled }: InputProps) {
  const [balanceHovered, setBalanceHovered] = useState(false)

  const input = useAtomValue(inputAtom)
  const setValue = useUpdateInputValue(inputAtom)
  const setToken = useUpdateInputToken(inputAtom)
  const balance = mockCurrencyAmount

  return (
    <InputColumn gap={0.5} approved={input.approved !== false}>
      <Row>
        <ThemedText.Subhead2 color="secondary">
          <Trans>Trading</Trans>
        </ThemedText.Subhead2>
      </Row>
      <TokenInput
        input={input}
        disabled={disabled}
        onMax={balance ? () => setValue(1234) : undefined}
        onChangeInput={setValue}
        onChangeToken={setToken}
      >
        <ThemedText.Body2 color="secondary">
          <Row>
            {input.usdc ? `~ $${input.usdc.toLocaleString('en')}` : '-'}
            {balance && (
              <Popover content={balance.toExact()} show={balanceHovered} placement={auto}>
                <ThemedText.Body2
                  color={input.value && balance.lessThan(input.value) ? 'error' : undefined}
                  onMouseEnter={() => setBalanceHovered(true)}
                  onMouseLeave={() => setBalanceHovered(false)}
                >
                  Balance: <span style={{ userSelect: 'text' }}>{balance.toExact()}</span>
                </ThemedText.Body2>
              </Popover>
            )}
          </Row>
        </ThemedText.Body2>
      </TokenInput>
      <Row />
    </InputColumn>
  )
}
