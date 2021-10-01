import { createSelector } from '@reduxjs/toolkit'
import { OutgoingMessageState } from 'arb-ts'
import { AppState } from '..'
import { NETWORK_DETAIL } from '../../constants'
import { getBridgeTxStatus, PendingReasons, txnTypeToOrigin } from '../../utils/arbitrum'
import { chainIdSelector } from '../application/selectors'
import { BridgeTransactionLog, BridgeTransactionSummary, BridgeTxn, BridgeTxnsState } from './types'

export const bridgeTxsSelector = (state: AppState) => state.bridgeTransactions

export const bridgeAllTxsSelector = createSelector(
  chainIdSelector,
  bridgeTxsSelector,
  ({ l1ChainId, l2ChainId }, txs) => {
    const transactions: BridgeTxnsState = {}

    if (l1ChainId && l2ChainId) {
      transactions[l1ChainId] = txs[l1ChainId]
      transactions[l2ChainId] = txs[l2ChainId]
    }

    return transactions
  }
)

export const bridgePendingTxsSelector = createSelector(
  chainIdSelector,
  bridgeTxsSelector,
  ({ l1ChainId, l2ChainId }, txs) => {
    let transactions: BridgeTxn[] = []

    if (l1ChainId && l2ChainId) {
      transactions = [
        ...Object.values(txs[l1ChainId] ?? {}).filter(tx => !tx?.receipt),
        ...Object.values(txs[l2ChainId] ?? {}).filter(tx => !tx?.receipt)
      ]
    }

    return transactions
  }
)

export const bridgeL1DepositsSelector = createSelector(
  chainIdSelector,
  bridgeTxsSelector,
  ({ l1ChainId, l2ChainId }, txs) => {
    let transactions: BridgeTxn[] = []

    if (l1ChainId && l2ChainId) {
      transactions = [
        ...Object.values(txs[l1ChainId] ?? {}).filter(tx => {
          return (tx.type === 'deposit' || tx.type === 'deposit-l1') && tx?.receipt?.status === 1
        })
      ]
    }

    return transactions
  }
)

export const bridgePendingWithdrawalsSelector = createSelector(
  chainIdSelector,
  bridgeTxsSelector,
  ({ l2ChainId }, txs) => {
    let transactions: BridgeTxn[] = []

    if (l2ChainId && txs[l2ChainId]) {
      const l2Txs = txs[l2ChainId]

      transactions = Object.values(l2Txs).filter(
        tx =>
          tx.type === 'withdraw' &&
          tx.outgoingMessageState !== OutgoingMessageState.CONFIRMED &&
          tx.outgoingMessageState !== OutgoingMessageState.EXECUTED
      )
    }

    return transactions
  }
)

export const createBridgeLog = (transactions: BridgeTxn[]): BridgeTransactionLog[] => {
  return transactions.map(tx => ({
    txHash: tx.txHash,
    chainId: tx.chainId,
    type: tx.type,
    status: getBridgeTxStatus(tx.receipt?.status)
  }))
}

export const bridgeTxsSummarySelector = createSelector(
  chainIdSelector,
  bridgeTxsSelector,
  ({ l1ChainId, l2ChainId }, txs) => {
    if (l1ChainId && l2ChainId && txs[l1ChainId] && txs[l2ChainId]) {
      const l1Txs = txs[l1ChainId]
      const l2Txs = txs[l2ChainId]

      const processedTxsMap: {
        [chainId: number]: {
          [txHash: string]: string
        }
      } = { [l1ChainId]: {}, [l2ChainId]: {} }

      const l1Summaries = Object.values(l1Txs).reduce<BridgeTransactionSummary[]>((total, tx) => {
        const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
        const to = from === l1ChainId ? l2ChainId : l1ChainId

        // No pair
        if (processedTxsMap[l1ChainId][tx.txHash]) return total

        const summary: BridgeTransactionSummary = {
          assetName: tx.assetName,
          fromName: NETWORK_DETAIL[from].chainName,
          toName: NETWORK_DETAIL[to].chainName,
          status: getBridgeTxStatus(tx.receipt?.status),
          value: tx.value,
          batchIndex: tx.batchIndex,
          batchNumber: tx.batchNumber,
          pendingReason: tx.receipt?.status ? undefined : PendingReasons.TX_UNCONFIRMED,
          log: []
        }

        if (!tx.partnerTxHash || !l2Txs[tx.partnerTxHash]) {
          summary.log = createBridgeLog([tx])

          // deposits on l1 should never show confirmed on UI
          if (tx.type === 'deposit-l1' && tx.receipt?.status !== 0) {
            summary.status = 'pending'
            summary.pendingReason = PendingReasons.DESPOSIT
          }
          processedTxsMap[l1ChainId][tx.txHash] = tx.txHash

          total.push(summary)
          return total
        }

        // Has pair & is deposit
        if (tx.receipt?.status === 1 && tx.type === 'deposit-l1') {
          const status = l2Txs[tx.partnerTxHash].receipt?.status
          summary.log = createBridgeLog([tx, l2Txs[tx.partnerTxHash]])
          summary.status = getBridgeTxStatus(status)
          summary.pendingReason = status ? undefined : PendingReasons.TX_UNCONFIRMED

          processedTxsMap[l1ChainId][tx.txHash] = tx.txHash
          processedTxsMap[l2ChainId][tx.partnerTxHash] = tx.partnerTxHash
          total.push(summary)
          return total
        }

        return total
      }, [])

      const l2Summaries = Object.values(l2Txs).reduce<BridgeTransactionSummary[]>((total, tx) => {
        // No pair
        const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
        const to = from === l1ChainId ? l2ChainId : l1ChainId

        if (processedTxsMap[l2ChainId][tx.txHash]) return total

        const summary: BridgeTransactionSummary = {
          assetName: tx.assetName,
          fromName: NETWORK_DETAIL[from].chainName,
          toName: NETWORK_DETAIL[to].chainName,
          status: getBridgeTxStatus(tx.receipt?.status),
          value: tx.value,
          log: []
        }

        if (!tx.partnerTxHash || !l1Txs[tx.partnerTxHash]) {
          // display state of outgoing message state when withdrawal
          if (tx.type === 'withdraw') {
            switch (tx.outgoingMessageState) {
              case OutgoingMessageState.CONFIRMED:
                summary.status = 'redeem'
                break
              case OutgoingMessageState.EXECUTED:
                summary.status = 'failed'
                break
              default:
                summary.status = 'pending'
                summary.pendingReason = PendingReasons.WITHDRAWAL
            }
          }
          summary.log = createBridgeLog([tx])
          processedTxsMap[l2ChainId][tx.txHash] = tx.txHash
          total.push(summary)
          return total
        }

        return total
      }, [])

      return [...l1Summaries, ...l2Summaries]
    }

    return []
  }
)
