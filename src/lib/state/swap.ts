import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { atomWithImmer } from 'jotai/immer'
import { pickAtom } from 'lib/state/atoms'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface Swap {
  independentField: Field
  readonly amount: string
  readonly [Field.INPUT]: {
    readonly currencyId?: string
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId?: string
  }
  integratorFee?: number
}

export const swapAtom = atomWithImmer<Swap>({
  independentField: Field.INPUT,
  amount: '',
  [Field.INPUT]: { currencyId: 'ETH' },
  [Field.OUTPUT]: { currencyId: undefined },
})

export const independentFieldAtom = pickAtom(swapAtom, 'independentField')
export const integratorFeeAtom = pickAtom(swapAtom, 'integratorFee')
export const amountAtom = pickAtom(swapAtom, 'amount')

export interface SwapTransaction {
  input: CurrencyAmount<Currency>
  output: CurrencyAmount<Currency>
  receipt: string
  timestamp: number
  elapsedMs?: number
  status?: true | Error
}

export const transactionAtom = atomWithImmer<SwapTransaction | null>(null)
