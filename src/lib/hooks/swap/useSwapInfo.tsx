import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useClientSideV3Trade } from 'hooks/useClientSideV3Trade'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { maxSlippageAtom } from 'lib/state/settings'
import { Field, swapAtom } from 'lib/state/swap'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useEffect, useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'

import { isAddress } from '../../../utils'
import useActiveWeb3React from '../useActiveWeb3React'

interface SwapInfo {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  currencyAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  trade: {
    trade?: InterfaceTrade<Currency, Currency, TradeType>
    state: TradeState
  }
  allowedSlippage: Percent
}

const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

// from the current swap inputs, compute the best trade and return it.
function useComputeSwapInfo(): SwapInfo {
  const { account } = useActiveWeb3React()

  const {
    independentField,
    amount,
    [Field.INPUT]: inputCurrency,
    [Field.OUTPUT]: outputCurrency,
  } = useAtomValue(swapAtom)

  const to = account

  const relevantTokenBalances = useCurrencyBalances(
    account,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(amount, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, amount]
  )

  /**
   * @TODO (ianlapham): eventually need a strategy for routing API here
   */
  const trade = useClientSideV3Trade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  )

  const currencies = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    }),
    [inputCurrency, outputCurrency]
  )

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const currencyAmounts = useMemo(
    () => ({
      [Field.INPUT]: trade.trade?.inputAmount,
      [Field.OUTPUT]: trade.trade?.outputAmount,
    }),
    [trade.trade?.inputAmount, trade.trade?.outputAmount]
  )

  /*
   * If user has enabled 'auto' slippage, use the default best slippage calculated
   * based on the trade. If user has entered custom slippage, use that instead.
   */
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const maxSlippage = useAtomValue(maxSlippageAtom)
  const allowedSlippage = useMemo(
    () => (maxSlippage === 'auto' ? autoSlippageTolerance : maxSlippage),
    [autoSlippageTolerance, maxSlippage]
  )

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    }

    return inputError
  }, [account, allowedSlippage, currencies, currencyBalances, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      currencyAmounts,
      inputError,
      trade,
      allowedSlippage,
    }),
    [currencies, currencyBalances, currencyAmounts, inputError, trade, allowedSlippage]
  )
}

const swapInfoAtom = atom<SwapInfo>({
  currencies: {},
  currencyBalances: {},
  currencyAmounts: {},
  trade: { state: TradeState.INVALID },
  allowedSlippage: new Percent(0),
})

export function SwapInfoUpdater() {
  const setSwapInfo = useUpdateAtom(swapInfoAtom)
  const swapInfo = useComputeSwapInfo()
  useEffect(() => {
    setSwapInfo(swapInfo)
  }, [swapInfo, setSwapInfo])
  return null
}

/* Requires that SwapInfoUpdater be installed in the DOM tree. */
export default function useSwapInfo(): SwapInfo {
  return useAtomValue(swapInfoAtom)
}
