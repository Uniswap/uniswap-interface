import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import React, { useMemo } from 'react'
import { Text } from 'src/components/Text'
import { ChainId, MAINNET_CHAIN_IDS } from 'src/constants/chains'
import { ChainIdToAddressToCurrencyAmount } from 'src/features/balances/hooks'
import { useTokenPrices } from 'src/features/historicalChainData/useTokenPrices'
import { AccountType } from 'src/features/wallet/accounts/types'
import { useActiveAccount } from 'src/features/wallet/hooks'
import { currencyId } from 'src/utils/currencyId'
import { formatUSDPrice } from 'src/utils/format'
import { flattenObjectOfObjects } from 'src/utils/objects'

interface TotalBalanceViewProps {
  balances: ChainIdToAddressToCurrencyAmount
}

function useTotalBalance(
  balances: CurrencyAmount<Currency>[],
  tokenPricesByChain: ReturnType<typeof useTokenPrices>
) {
  const activeAccount = useActiveAccount()
  const filteredBalances =
    activeAccount?.type === AccountType.Readonly
      ? balances.filter((currencyAmount) =>
          MAINNET_CHAIN_IDS.includes(currencyAmount.currency.chainId)
        )
      : balances

  return useMemo(() => {
    return {
      isLoading: tokenPricesByChain.isLoading,
      totalBalance: filteredBalances
        .map((currencyAmount) => {
          const currentPrice =
            tokenPricesByChain.chainIdToPrices[currencyAmount.currency.chainId as ChainId]
              ?.addressToPrice?.[currencyId(currencyAmount.currency)]?.priceUSD

          return (currentPrice ?? 0) * parseFloat(currencyAmount.toSignificant(6))
        })
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
    }
  }, [filteredBalances, tokenPricesByChain])
}

export function TotalBalance({ balances }: TotalBalanceViewProps) {
  const allBalances = flattenObjectOfObjects(balances)
  const currenciesToFetch = allBalances.map((currencyAmount) => currencyAmount.currency)
  const tokenPricesByChain = useTokenPrices(currenciesToFetch)
  const { totalBalance } = useTotalBalance(allBalances, tokenPricesByChain)

  // TODO (tina): add loading placeholder once useTotalBalance.isLoading is behaving correctly

  return <Text variant="h1">{`${formatUSDPrice(totalBalance)}`}</Text>
}
