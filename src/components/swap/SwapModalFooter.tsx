import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { ElementName, Event, EventName } from 'components/AmplitudeAnalytics/constants'
import { TraceEvent } from 'components/AmplitudeAnalytics/TraceEvent'
import {
  formatPercentInBasisPointsNumber,
  formatPercentNumber,
  formatToDecimal,
  getDurationFromDateMilliseconds,
  getDurationUntilTimestampSeconds,
  getTokenAddress,
} from 'components/AmplitudeAnalytics/utils'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { ReactNode } from 'react'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import { useClientSideRouter, useUserSlippageTolerance } from 'state/user/hooks'
import { computeRealizedPriceImpact } from 'utils/prices'

import { ButtonError } from '../Button'
import { AutoRow } from '../Row'
import { SwapCallbackError } from './styleds'
import { getTokenPath, RoutingDiagramEntry } from './SwapRoute'

interface AnalyticsEventProps {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hash: string | undefined
  allowedSlippage: Percent
  transactionDeadlineSecondsSinceEpoch: number | undefined
  isAutoSlippage: boolean
  isAutoRouterApi: boolean
  tokenInAmountUsd: string | undefined
  tokenOutAmountUsd: string | undefined
  swapQuoteReceivedDate: Date | undefined
  routes: RoutingDiagramEntry[]
}

const formatRoutesEventProperties = (routes: RoutingDiagramEntry[]) => {
  const routesEventProperties: Record<string, any[]> = {
    routes_percentages: [],
    routes_protocols: [],
  }

  routes.forEach((route, index) => {
    routesEventProperties['routes_percentages'].push(formatPercentNumber(route.percent))
    routesEventProperties['routes_protocols'].push(route.protocol)
    routesEventProperties[`route_${index}_input_currency_symbols`] = route.path.map(
      (pathStep) => pathStep[0].symbol ?? ''
    )
    routesEventProperties[`route_${index}_output_currency_symbols`] = route.path.map(
      (pathStep) => pathStep[1].symbol ?? ''
    )
    routesEventProperties[`route_${index}_input_currency_addresses`] = route.path.map((pathStep) =>
      getTokenAddress(pathStep[0])
    )
    routesEventProperties[`route_${index}_output_currency_addresses`] = route.path.map((pathStep) =>
      getTokenAddress(pathStep[1])
    )
    routesEventProperties[`route_${index}_fee_amounts_hundredths_of_bps`] = route.path.map((pathStep) => pathStep[2])
  })

  return routesEventProperties
}

const formatAnalyticsEventProperties = ({
  trade,
  hash,
  allowedSlippage,
  transactionDeadlineSecondsSinceEpoch,
  isAutoSlippage,
  isAutoRouterApi,
  tokenInAmountUsd,
  tokenOutAmountUsd,
  swapQuoteReceivedDate,
  routes,
}: AnalyticsEventProps) => ({
  estimated_network_fee_usd: trade.gasUseEstimateUSD ? formatToDecimal(trade.gasUseEstimateUSD, 2) : undefined,
  transaction_hash: hash,
  transaction_deadline_seconds: getDurationUntilTimestampSeconds(transactionDeadlineSecondsSinceEpoch),
  token_in_amount_usd: tokenInAmountUsd ? parseFloat(tokenInAmountUsd) : undefined,
  token_out_amount_usd: tokenOutAmountUsd ? parseFloat(tokenOutAmountUsd) : undefined,
  token_in_address: getTokenAddress(trade.inputAmount.currency),
  token_out_address: getTokenAddress(trade.outputAmount.currency),
  token_in_symbol: trade.inputAmount.currency.symbol,
  token_out_symbol: trade.outputAmount.currency.symbol,
  token_in_amount: formatToDecimal(trade.inputAmount, trade.inputAmount.currency.decimals),
  token_out_amount: formatToDecimal(trade.outputAmount, trade.outputAmount.currency.decimals),
  price_impact_basis_points: formatPercentInBasisPointsNumber(computeRealizedPriceImpact(trade)),
  allowed_slippage_basis_points: formatPercentInBasisPointsNumber(allowedSlippage),
  is_auto_router_api: isAutoRouterApi,
  is_auto_slippage: isAutoSlippage,
  chain_id:
    trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
      ? trade.inputAmount.currency.chainId
      : undefined,
  duration_from_first_quote_to_swap_submission_milliseconds: swapQuoteReceivedDate
    ? getDurationFromDateMilliseconds(swapQuoteReceivedDate)
    : undefined,
  swap_quote_block_number: trade.blockNumber,
  ...formatRoutesEventProperties(routes),
})

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  hash,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  hash: string | undefined
  allowedSlippage: Percent
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  swapQuoteReceivedDate: Date | undefined
}) {
  const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  const isAutoSlippage = useUserSlippageTolerance() === 'auto'
  const [clientSideRouter] = useClientSideRouter()
  const tokenInAmountUsd = useStablecoinValue(trade.inputAmount)?.toFixed(2)
  const tokenOutAmountUsd = useStablecoinValue(trade.outputAmount)?.toFixed(2)
  const routes = getTokenPath(trade)

  return (
    <>
      <AutoRow>
        <TraceEvent
          events={[Event.onClick]}
          element={ElementName.CONFIRM_SWAP_BUTTON}
          name={EventName.SWAP_SUBMITTED}
          properties={formatAnalyticsEventProperties({
            trade,
            hash,
            allowedSlippage,
            transactionDeadlineSecondsSinceEpoch,
            isAutoSlippage,
            isAutoRouterApi: !clientSideRouter,
            tokenInAmountUsd,
            tokenOutAmountUsd,
            swapQuoteReceivedDate,
            routes,
          })}
        >
          <ButtonError
            onClick={onConfirm}
            disabled={disabledConfirm}
            style={{ margin: '10px 0 0 0' }}
            id={ElementName.CONFIRM_SWAP_BUTTON}
          >
            <Text fontSize={20} fontWeight={500}>
              <Trans>Confirm Swap</Trans>
            </Text>
          </ButtonError>
        </TraceEvent>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
