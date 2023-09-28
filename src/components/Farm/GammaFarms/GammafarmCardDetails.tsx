import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Token } from '@pollum-io/sdk-core'
import { formatNumber } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import Divider from 'components/Divider/Divider'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useToken } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useGammaHypervisorContract, useGammaUniProxyContract, useMasterChefContract } from 'hooks/useContract'
import { useSingleCallResult } from 'lib/hooks/multicall'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useIsMobile } from 'nft/hooks'
import React, { useState } from 'react'
import { Box } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useTransactionFinalizer } from 'utils/farmUtils'

import { TransactionType } from '../../../state/transactions/types'
import { FarmPoolData } from '../constants'
import { GridItemGammaCard } from './GridItemGammaCard'

// Estilo do Grid
const Grid = styled.div<{ isMobile: boolean; hasRewards: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: ${(props) => (props.isMobile ? 'none' : 'repeat(3, 1fr)')};
  grid-template-rows: ${(props) =>
    props.isMobile ? (props.hasRewards ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)') : 'none'};
  gap: 16px;
`

// Estilo do Item do Grid
const GridItem = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 18px;
`

const ClaimContainer = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
`
const GammaFarmCardDetails: React.FC<{
  data: FarmPoolData
  pairData: any
  rewardData: any
}> = ({ pairData, rewardData, data }) => {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const finalizedTransaction = useTransactionFinalizer()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unStakeAmount, setUnStakeAmount] = useState('')
  const [approveOrStaking, setApproveOrStaking] = useState(false)
  const [attemptUnstaking, setAttemptUnstaking] = useState(false)
  const [attemptClaiming, setAttemptClaiming] = useState(false)
  const isMobile = useIsMobile()
  const theme = useTheme()
  const rewardTokenAddress = rewardData?.rewardTokenAddress
  const masterChefContract = useMasterChefContract()
  const hypervisorContract = useGammaHypervisorContract(pairData.hypervisor)
  const uniProxyContract = useGammaUniProxyContract()
  const token = useToken(rewardTokenAddress?.result?.toString())

  const stakedData = useSingleCallResult(masterChefContract, 'userInfo', [pairData.pid, account ?? undefined])

  const stakedAmountBN =
    !stakedData.loading && stakedData.result && stakedData.result.length > 0 ? stakedData.result[0] : undefined
  const stakedAmount = stakedAmountBN ? formatUnits(stakedAmountBN, 18) : '0'

  const lpTokenUSD =
    data && data.totalSupply && Number(data.totalSupply) > 0
      ? (Number(data.tvlUSD) / Number(data.totalSupply)) * 10 ** 18
      : 0
  const stakedUSD = Number(stakedAmount) * lpTokenUSD

  const rewards = useSingleCallResult(masterChefContract, 'pendingReward', [pairData.pid, account ?? undefined])
  const rewardsBN = !rewards.loading && rewards.result && rewards.result.length > 0 ? rewards.result[0] : undefined
  const rewardsAmount = rewardsBN ? formatUnits(rewardsBN, 18) : '0'

  const lpToken = chainId ? new Token(chainId, pairData.hypervisor, 18) : undefined

  const rewardTokenContract = useSingleCallResult(masterChefContract, 'REWARD')
  const rewardToken = useToken(rewardTokenContract?.result?.toString())

  const lpBalanceData = useSingleCallResult(hypervisorContract, 'balanceOf', [account ?? undefined])
  const lpBalanceBN =
    !lpBalanceData.loading && lpBalanceData.result && lpBalanceData.result.length > 0
      ? lpBalanceData.result[0]
      : undefined
  const availableStakeAmount = lpBalanceBN ? formatUnits(lpBalanceBN, 18) : '0'

  const availableStakeUSD = Number(availableStakeAmount) * lpTokenUSD
  const lpTokenBalance = tryParseCurrencyAmount(availableStakeAmount, lpToken)

  const parsedStakeAmount = tryParseCurrencyAmount(stakeAmount, lpToken)

  const stakeButtonDisabled =
    Number(stakeAmount) <= 0 ||
    !lpTokenBalance ||
    parsedStakeAmount?.greaterThan(lpTokenBalance) ||
    !masterChefContract ||
    !account ||
    approveOrStaking

  const unStakeButtonDisabled =
    Number(unStakeAmount) <= 0 ||
    Number(unStakeAmount) > Number(stakedAmount) ||
    !masterChefContract ||
    !account ||
    attemptUnstaking

  const [approval, approveCallback] = useApproveCallback(parsedStakeAmount, masterChefContract?.address)

  const claimButtonDisabled = Number(rewardsAmount) == 0 || attemptClaiming

  const approveOrStakeLP = async () => {
    setApproveOrStaking(true)
    try {
      if (approval === ApprovalState.APPROVED) {
        await stakeLP()
      } else {
        await approveCallback()
      }
      setApproveOrStaking(false)
    } catch (e) {
      console.log('Err:', e)
      setApproveOrStaking(false)
    }
  }

  const stakeLP = async () => {
    if (!masterChefContract || !account || !lpBalanceBN) return
    let response: TransactionResponse
    if (pairData.masterChefIndex === 2) {
      const estimatedGas = await masterChefContract.estimateGas.deposit(
        pairData.pid,
        stakeAmount === availableStakeAmount ? lpBalanceBN : parseUnits(Number(stakeAmount).toFixed(18), 18)
      )
      response = await masterChefContract.deposit(
        pairData.pid,
        stakeAmount === availableStakeAmount ? lpBalanceBN : parseUnits(Number(stakeAmount).toFixed(18), 18),
        {
          gasLimit: calculateGasMargin(estimatedGas),
        }
      )
    } else {
      const estimatedGas = await masterChefContract.estimateGas.deposit(
        pairData.pid,
        stakeAmount === availableStakeAmount ? lpBalanceBN : parseUnits(Number(stakeAmount).toFixed(18), 18),
        account
      )
      response = await masterChefContract.deposit(
        pairData.pid,
        stakeAmount === availableStakeAmount ? lpBalanceBN : parseUnits(Number(stakeAmount).toFixed(18), 18),
        account,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        }
      )
    }
    addTransaction(response, {
      type: TransactionType.DEPOSIT_FARM,
      pid: pairData.pid,
      amount: (stakeAmount === availableStakeAmount
        ? lpBalanceBN
        : parseUnits(Number(stakeAmount).toFixed(18), 18)
      ).toString(),
      tokenAddress: pairData.hypervisor,
    })
    const receipt = await response.wait()
    finalizedTransaction(receipt, {
      summary: 'depositliquidity',
    })
  }

  const unStakeLP = async () => {
    if (!masterChefContract || !account || !stakedAmountBN) return
    setAttemptUnstaking(true)
    try {
      let response: TransactionResponse
      if (pairData.masterChefIndex === 2) {
        const estimatedGas = await masterChefContract.estimateGas.withdraw(
          pairData.pid,
          unStakeAmount === stakedAmount ? stakedAmountBN : parseUnits(Number(unStakeAmount).toFixed(18), 18)
        )
        response = await masterChefContract.withdraw(
          pairData.pid,
          unStakeAmount === stakedAmount ? stakedAmountBN : parseUnits(Number(unStakeAmount).toFixed(18), 18),
          {
            gasLimit: calculateGasMargin(estimatedGas),
          }
        )
      } else {
        const estimatedGas = await masterChefContract.estimateGas.withdraw(
          pairData.pid,
          unStakeAmount === stakedAmount ? stakedAmountBN : parseUnits(Number(unStakeAmount).toFixed(18), 18),
          account
        )
        response = await masterChefContract.withdraw(
          pairData.pid,
          unStakeAmount === stakedAmount ? stakedAmountBN : parseUnits(Number(unStakeAmount).toFixed(18), 18),
          account,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          }
        )
      }

      addTransaction(response, {
        type: TransactionType.WITHDRAW_FARM,
        pid: pairData.pid,
        amount: (unStakeAmount === stakedAmount
          ? stakedAmountBN
          : parseUnits(Number(unStakeAmount).toFixed(18), 18)
        ).toString(),
        tokenAddress: pairData.hypervisor,
      })
      const receipt = await response.wait()
      finalizedTransaction(receipt, {
        summary: 'withdrawliquidity',
      })
      setAttemptUnstaking(false)
    } catch (e) {
      setAttemptUnstaking(false)
      console.log('err: ', e)
    }
  }

  const claimReward = async () => {
    if (!masterChefContract || !account) return
    setAttemptClaiming(true)
    try {
      const estimatedGas = await masterChefContract.estimateGas.harvest(pairData.pid, account)
      const response: TransactionResponse = await masterChefContract.harvest(pairData.pid, account, {
        gasLimit: calculateGasMargin(estimatedGas),
      })

      addTransaction(response, {
        type: TransactionType.CLAIM_FARM,
        pid: pairData.pid,
        amount: rewardsBN.toString(),
        tokenAddress: rewardData.rewardTokenAddress,
      })
      const receipt = await response.wait()
      finalizedTransaction(receipt, {
        summary: 'claimrewards',
      })
      setAttemptClaiming(false)
    } catch (e) {
      setAttemptClaiming(false)
      console.log('err: ', e)
    }
  }

  return (
    <Box width="100%">
      {!isMobile && <Divider margin="none" />}
      {isMobile && (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                fontWeight: 600,
              }}
            >
              <small style={{ color: theme.accentActive }}>TVL</small>
              {rewardData?.tvl && <small style={{ fontWeight: 600 }}> ${formatNumber(rewardData.tvl)}</small>}
            </div>
            <div
              style={{
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
              }}
            >
              <small style={{ color: theme.accentActive }}>Rewards</small>
              <small style={{ display: 'flex', justifyContent: 'space-between' }}>
                {rewardsAmount &&
                  Number(rewardsAmount) > 0 &&
                  token &&
                  `${formatNumber(Number(rewardsAmount) * 3600 * 24)} ${token.symbol} / day`}
              </small>
            </div>
          </div>
          <Divider margin="none" />
        </>
      )}
      <div style={{ padding: 1.5 }}>
        <Grid isMobile={isMobile} hasRewards={Number(rewardsAmount) > 0}>
          {pairData.ableToFarm && (
            <GridItemGammaCard
              titleText="Available:"
              approveOrStakeLP={approveOrStakeLP}
              availableStakeAmount={availableStakeAmount}
              availableStakeUSD={availableStakeUSD}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              stakeButtonDisabled={stakeButtonDisabled}
              textButton={
                approval === ApprovalState.APPROVED
                  ? approveOrStaking
                    ? 'stakingLPTokens'
                    : 'stakeLPTokens'
                  : approveOrStaking
                  ? 'approving'
                  : 'approve'
              }
              setUnStakeAmount={setUnStakeAmount}
            />
          )}

          <GridItemGammaCard
            titleText="Deposited:"
            stakedUSD={stakedUSD}
            setUnStakeAmount={setUnStakeAmount}
            stakedAmount={stakedAmount}
            unStakeAmount={unStakeAmount}
            unStakeButtonDisabled={unStakeButtonDisabled}
            textButton={attemptUnstaking ? 'unstakingLPTokens' : 'unstakeLPTokens'}
            setStakeAmount={setStakeAmount}
            stakeAmount={stakeAmount}
            unStakeLP={unStakeLP}
          />

          {rewardToken && Number(rewardsAmount) !== 0 && (
            <GridItem>
              <ClaimContainer>
                <small style={{ color: theme.textSecondary }}>EarnedRewards</small>
                <div style={{ marginBottom: 10, marginTop: 10 }}>
                  <div
                    key={rewardToken.address}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <CurrencyLogo currency={rewardToken} size="16px" />
                    <div style={{ marginLeft: '6px' }}>
                      <small>
                        {formatNumber(Number(rewardsAmount))} {rewardToken.symbol}
                      </small>
                    </div>
                  </div>
                </div>
                <Box width="100%">
                  <ButtonPrimary style={{ height: '40px' }} disabled={claimButtonDisabled} onClick={claimReward}>
                    {attemptClaiming ? 'claiming' : 'claim'}
                  </ButtonPrimary>
                </Box>
              </ClaimContainer>
            </GridItem>
          )}
        </Grid>
      </div>
    </Box>
  )
}

export default GammaFarmCardDetails
