import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, Percent } from '@kinetix/sdk-core'
import { SwapRouter, UNIVERSAL_ROUTER_ADDRESS } from '@kinetix/universal-router-sdk'
import { FeeOptions, toHex } from '@kinetix/v3-sdk'
import { t } from '@lingui/macro'
// import { OpenoceanApiSdk } from '@openocean.finance/api'
import { SwapEventName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
import { sendAnalyticsEvent, useTrace } from 'analytics'
import { formatCommonPropertiesForTrade, formatSwapSignedAnalyticsEventProperties } from 'lib/utils/analytics'
import { useCallback } from 'react'
import { ClassicTrade, TradeFillType } from 'state/routing/types'
import { trace } from 'tracing/trace'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { UserRejectedRequestError } from 'utils/errors'
import isZero from 'utils/isZero'
import { didUserReject, swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

import { PermitSignature } from './usePermitAllowance'

/** Thrown when gas estimation fails. This class of error usually requires an emulator to determine the root cause. */
class GasEstimationError extends Error {
  constructor() {
    super(t`Your swap is expected to fail.`)
  }
}

/**
 * Thrown when the user modifies the transaction in-wallet before submitting it.
 * In-wallet calldata modification nullifies any safeguards (eg slippage) from the interface, so we recommend reverting them immediately.
 */
class ModifiedSwapError extends Error {
  constructor() {
    super(
      t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
    )
  }
}

interface SwapOptions {
  slippageTolerance: Percent
  deadline?: BigNumber
  permit?: PermitSignature
  feeOptions?: FeeOptions
}

async function swapQuote(account: string, chainId: ChainId, data: any, value: any) {
  console.log('swapQuote', account, chainId, data, value)

  // const openoceanApiSdk = new OpenoceanApiSdk()
  // const { swapSdk } = openoceanApiSdk

  // const swapData = await swapSdk.swapQuote({
  //   chain: 'terra',
  //   inTokenAddress: 'uusd',
  //   outTokenAddress: 'terra13awdgcx40tz5uygkgm79dytez3x87rpg4uhnvu',
  //   amount: 0.01,
  //   slippage: 1,
  //   // account: this.wallet.address,
  //   // gasPrice: req.data.gasPrice,
  // })
  // if (swapData.code == 200) {
  //   swapSdk
  //     .swap(swapData.data)
  //     .on('error', (error: any) => {
  //       console.log(error)
  //     })
  //     .on('transactionHash', (hash: any) => {
  //       console.log(hash)
  //     })
  //     .on('receipt', (data: any) => {
  //       console.log(data)
  //     })
  //     .on('success', (data: any) => {
  //       console.log(data)
  //     })
  // } else {
  //   console.log(swapData.message)
  // }
}

export function useUniversalRouterSwapCallback(
  trade: ClassicTrade | undefined,
  fiatValues: { amountIn?: number; amountOut?: number },
  options: SwapOptions
) {
  const { account, chainId, provider } = useWeb3React()
  const analyticsContext = useTrace()
  console.log('useUniversalRouterSwapCallback')

  return useCallback(async () => {
    return trace('swap.send', async ({ setTraceData, setTraceStatus, setTraceError }) => {
      console.log('useUniversalRouterSwapCallback useCallback')
      try {
        if (!account) throw new Error('missing account')
        if (!chainId) throw new Error('missing chainId')
        if (!provider) throw new Error('missing provider')
        if (!trade) throw new Error('missing trade')
        const connectedChainId = await provider.getSigner().getChainId()
        if (chainId !== connectedChainId) throw new Error('signer chainId does not match')

        setTraceData('slippageTolerance', options.slippageTolerance.toFixed(2))
        const { calldata: data, value } = SwapRouter.swapERC20CallParameters(<any>trade, {
          slippageTolerance: options.slippageTolerance,
          deadlineOrPreviousBlockhash: options.deadline?.toString(),
          inputTokenPermit: options.permit,
          fee: options.feeOptions,
        })
        swapQuote(account, chainId, data, value)
        const tx = {
          from: account,
          to: UNIVERSAL_ROUTER_ADDRESS(chainId),
          data,
          // TODO(https://github.com/Uniswap/universal-router-sdk/issues/113): universal-router-sdk returns a non-hexlified value.
          ...(value && !isZero(value) ? { value: toHex(value) } : {}),
        }

        let gasEstimate: BigNumber
        try {
          gasEstimate = await provider.estimateGas(tx)
        } catch (gasError) {
          setTraceStatus('failed_precondition')
          setTraceError(gasError)
          sendAnalyticsEvent(SwapEventName.SWAP_ESTIMATE_GAS_CALL_FAILED, {
            ...formatCommonPropertiesForTrade(trade, options.slippageTolerance),
            ...analyticsContext,
            tx,
            error: gasError,
          })
          console.warn(gasError)
          throw new GasEstimationError()
        }
        const gasLimit = calculateGasMargin(gasEstimate)
        setTraceData('gasLimit', gasLimit.toNumber())
        const beforeSign = Date.now()
        const response = await provider
          .getSigner()
          .sendTransaction({ ...tx, gasLimit })
          .then((response) => {
            sendAnalyticsEvent(SwapEventName.SWAP_SIGNED, {
              ...formatSwapSignedAnalyticsEventProperties({
                trade,
                timeToSignSinceRequestMs: Date.now() - beforeSign,
                allowedSlippage: options.slippageTolerance,
                fiatValues,
                txHash: response.hash,
              }),
              ...analyticsContext,
            })
            if (tx.data !== response.data) {
              sendAnalyticsEvent(SwapEventName.SWAP_MODIFIED_IN_WALLET, {
                txHash: response.hash,
                ...analyticsContext,
              })
              throw new ModifiedSwapError()
            }
            return response
          })
        return {
          type: TradeFillType.Classic as const,
          response,
        }
      } catch (swapError: unknown) {
        if (swapError instanceof ModifiedSwapError) throw swapError

        if (!(swapError instanceof GasEstimationError)) setTraceError(swapError)

        // Cancellations are not failures, and must be accounted for as 'cancelled'.
        if (didUserReject(swapError)) {
          setTraceStatus('cancelled')
          // This error type allows us to distinguish between user rejections and other errors later too.
          throw new UserRejectedRequestError(swapErrorToUserReadableMessage(swapError))
        }

        throw new Error(swapErrorToUserReadableMessage(swapError))
      }
    })
  }, [
    account,
    analyticsContext,
    chainId,
    fiatValues,
    options.deadline,
    options.feeOptions,
    options.permit,
    options.slippageTolerance,
    provider,
    trade,
  ])
}
