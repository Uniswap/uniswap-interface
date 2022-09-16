import { CurrencyAmount, WETH9 } from '@uniswap/sdk-core'
import React, { useCallback } from 'react'

import _ from 'lodash'
import { useCurrency } from 'hooks/Tokens'
import useInterval from 'hooks/useInterval'
import useLast from 'hooks/useLast'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { useV2RouterContract } from 'hooks/useContract'
import { utils } from 'ethers'

const SwapVolumeContext = React.createContext<{ volumeInEth?: string, volumeInEthBn?: number, volumeInUsd?: number, volumeInUsdFormatted?: string }>({ volumeInEth: '', volumeInEthBn: 0, volumeInUsd: 0 })

export const SwapVolumeContextProvider = ({ children, chainId }: { children: any, chainId: number | undefined }) => {
    const relayer = useV2RouterContract(chainId)
    const trackingMap = React.useRef<Map<any, any>>(new Map())
    const defaultState = { formatted: '0', value: 0 };
    const [ethRelayed, setEthRelayed] = React.useReducer(function (state: any, action: { type: any, payload: any }) {
        switch (action.type) {
            case "UPDATE":
                return {
                    ...state,
                    ...action.payload
                };
            default:
                return state;
        }
    }, defaultState)
    const intervalFn = (
        React.useCallback(
            async (isIntervalledCallback: boolean) => {
            console.log('interval function->totalSwapVolume->', ethRelayed.formatted)
            if (relayer && (isIntervalledCallback || !ethRelayed.value)) {
                relayer.totalEthRelayed().then((response: any) => {
                    if (!_.isEqual(ethRelayed.value, response)) {
                        const formattedEth = parseFloat(utils.formatEther(response)).toFixed(6);
                        setEthRelayed({ type: "UPDATE", payload: { formatted: formattedEth, value: response } });
                    }
                })
            }
        }, [relayer, ethRelayed])
    )
    const [initialized, setInitialized] = React.useState(false)
    const intervalledFunction = async () => await intervalFn(true)
    const priorChainId = useLast(chainId)
    React.useEffect(() => {
        const needsRefetch = chainId && chainId != priorChainId;
        if (initialized && !needsRefetch) return

        if (needsRefetch)
            console.log(`[SwapVolumeContextProvider] - Refetch swapVolume due to chainId change, prior: ${priorChainId}, current: ${chainId}`);

        if ((relayer && !initialized) || needsRefetch) {
            const finished = () => setInitialized(true)
            intervalFn(true).then(finished)
        }
    }, [relayer, initialized, chainId])

    React.useEffect(() => {
         // this will keep the swap volume consistently updating, every 5 minutes or so.
          const interval = setInterval(async () => {
                console.log(`[SwapVolumeContextProvider] - Run Interval Update on Swap Volume`)
                await intervalledFunction()
            }, 60000 * 3.5)
            return () => clearInterval(interval)
    }, [])


    const ethCurrency = WETH9[1]

    const rawCurrencyAmount = React.useMemo(() => {
        if (!ethRelayed.value || ethRelayed.formatted === '0' || !ethCurrency)
            return undefined

        return CurrencyAmount.fromRawAmount(ethCurrency ?? undefined, ethRelayed.value)
    }, [ethRelayed, ethCurrency])

    const usdcValue = useUSDCValue(rawCurrencyAmount)
    const formattedUsdcValue = usdcValue ? usdcValue?.toFixed(6) : '0';
    const value = {
        volumeInEth: ethRelayed.formatted,
        volumeInEthBn: ethRelayed.value,
        volumeInUsd: parseFloat(formattedUsdcValue),
        volumeInUsdFormatted: parseFloat(formattedUsdcValue).toLocaleString()
    }
    return (<SwapVolumeContext.Provider value={value}>
        {children}
    </SwapVolumeContext.Provider>)
}

export const useSwapVolumeContext = () => {
    const context = React.useContext(SwapVolumeContext);
    if (!context) throw new Error(`Expected to be in SwapVolumeContext but was not`);
    return context;
}