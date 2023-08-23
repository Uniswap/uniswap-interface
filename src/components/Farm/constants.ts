// import { Price } from '@pollum-io/sdk-core'
import { Currency, Price } from '@pollum-io/sdk-core'
import { ChainId } from '@pollum-io/smart-order-router'
import { Pair } from '@pollum-io/v1-sdk'
import { TokenAmount } from 'graphql/utils/types'
import { Presets } from 'state/mint/v3/reducer'
import { Token } from 'types/v3'

interface CommonStakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount?: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount?: TokenAmount
  ended: boolean
  name: string
  lp: string
  baseToken: Token
  pair: string
  oneYearFeeAPY?: number
  oneDayFee?: number
  accountFee?: number
  tvl?: string
  perMonthReturnInRewards?: number
  totalSupply?: TokenAmount
  usdPrice?: Price<Currency, Currency>
  stakingTokenPair?: Pair | null
  sponsored: boolean
  sponsorLink: string
}

export interface StakingInfo extends CommonStakingInfo {
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount?: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate?: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate?: TokenAmount
  rewardToken: Token
  rewardTokenPrice: number
  rate: number
  valueOfTotalStakedAmountInBaseToken?: TokenAmount
}

export interface DualStakingInfo extends CommonStakingInfo {
  rewardTokenA: Token
  rewardTokenB: Token
  rewardTokenBBase: Token
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmountA?: TokenAmount
  earnedAmountB?: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRateA: TokenAmount
  totalRewardRateB: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRateA?: TokenAmount
  rewardRateB?: TokenAmount

  rateA: number
  rateB: number
  rewardTokenAPrice: number
  rewardTokenBPrice: number
}

export interface GammaPair {
  address: string
  title: string
  type: Presets
  token0Address: string
  token1Address: string
  ableToFarm?: boolean
  pid?: number
  masterChefIndex?: number
}

export const GammaPairs: {
  [chainId in ChainId]: {
    [key: string]: GammaPair[]
  }
} = {
  [ChainId.ROLLUX]: {
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x02203f2351e7ac6ab5051205172d3f772db7d814',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 0,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x81cec323bf8c4164c66ec066f53cc053a535f03d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 1,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x04d521e2c414e6d898c6f2599fdd863edf49e247',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 2,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x4a83253e88e77e8d518638974530d0cbbbf3b675',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 3,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3cc20a6795c4b57d9817399f68e83e71c8626580',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 4,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x6077177d4c41e114780d9901c9b5c784841c523f',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 5,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3f35705479d9d77c619b2aac9dd7a64e57151506',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 6,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xe40a5aa22cbccc8165aedd86f6d03fc5f551c3c6',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 7,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x4b9e26a02121a1c541403a611b542965bd4b68ce',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 8,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xadc7b4096c3059ec578585df36e6e1286d345367',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 9,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x9e31214db6931727b7d63a0d2b6236db455c0965',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        ableToFarm: true,
        pid: 10,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x795f8c9b0a0da9cd8dea65fc10f9b57abc532e58',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 11,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x7f09bd2801a7b795df29c273c4afbb0ff15e2d63',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 12,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x543403307bc9f9ec46fd9bc1048b263c9692a26a',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 13,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8dd3bf71ef18dd88869d128bde058c9d8c270176',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 14,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0xccbcaf47e87f50a338fac9bf58e567ed1c87be2b',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        ableToFarm: true,
        pid: 15,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x598cA33b7F5FAB560ddC8E76D94A4b4AA52566d7',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 16,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x9134f456D33d1288de26271730047AE0c5CB6F71',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 17,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xac15baba7bcc532f8727c1a42b23501f59630115',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 18,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xccbbb572eb5edc973a90fdc57d07d7740bb027f5',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 19,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3e99b86b16f36dcf3b987ebc8b754c54030403b5',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 20,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5ec3511b49d4fe7798015a26a83abdc01261615b',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 21,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xf86d6151d03007b1906465b63e36d6f48136bc39',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 22,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x454Ff7780A9A99Ecb3462ab61bA06fe4A886862E',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 23,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xa1c3e15b3307b04067e843d3bfaf3cead5b51cb7',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 24,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x4f7e090fe185aac68fc58e7fa1b9d4314d357327',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        ableToFarm: true,
        pid: 25,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x5928f9f61902b139e1c40cba59077516734ff09f',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 26,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3672d301778750c41a7864980a5ddbc2af99476e',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 27,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x7ae7fb44c92b4d41abb6e28494f46a2eb3c2a690',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        ableToFarm: true,
        pid: 28,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xfd73ce19d3842ad7b551bb184ac6c6256dc2c9ab',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 29,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x1c1b4cf2a40810c49a8b42a9da857cb0b76d06e3',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 30,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x46840e073376178b1e669693c021329b17fb22aa',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 31,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x14223bb48c8cf3ef49319be44a6e718e4dbf9486',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 32,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x69b2aaaf08ac9b04cd5b64a1d23ffcb40224fdaf',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 33,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x683292172e2175bd08e3927a5e72fc301b161300',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 34,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3ae59be14da16183f0a36e23518506c386e63a96',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 35,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfe4bb996926aca85c9747bbec886ec2a3f510c66',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 36,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2e18b825b049c4994370b0db6c35d0100295b96c',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 37,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x2c53dfa65370b2d70975e40172b63210d477e470',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 38,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xcfd4a6a885c4404a2a5720918a9b4880600876a8',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 39,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x05c731f5f922835796c49412a30615c46cca4d9e',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 40,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x9a4b458a5ae5d96565455d1e1882301fea5c076f',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        pid: 41,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xf6bE87Ae8976f50DCd231d42580e430CF6133400',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 42,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xee2a89071654333703b3d6c9be9ab8f085f977de',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f',
        pid: 43,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xe5417af564e4bfda1c483642db72007871397896': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x688cb9492bd2c72016f1765d813b2d713aa1f4c7',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        ableToFarm: true,
        pid: 44,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x566452e9d621a1902f9ccf2adaf029cf0f36ec67',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xe5417af564e4bfda1c483642db72007871397896',
        pid: 45,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xbbba073c31bf03b8acf7c28ef0738decf3695683': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xef4f95d8c252d64308c04f711fb31892cc4c9965',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        ableToFarm: true,
        pid: 46,
      },
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x62f88fb208df717b035325d065c6919d7913b937',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xbbba073c31bf03b8acf7c28ef0738decf3695683',
        pid: 47,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x706bae8828c260d5e52ccfa96f1258a2d2f6fdda',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc',
        pid: 48,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x1825c76ced3c1625250b8af6204bf4fc4e5b9fcf',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 49,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x3273c153ecc6891a68af60ee0b67c16dd7b2c7e5',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        ableToFarm: true,
        pid: 50,
      },
    ],
    '0xa3fa99a148fa48d14ed51d610c367c61876997f1-0xb5c064f955d8e7f38fe0460c556a72987494ee17': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x0f7e4c66cebb5f5cabd435684946585a917b2f65',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        pid: 51,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x535206aaeca58c038ef28ce9924c7782bbb3d94d',
        token0Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        token1Address: '0xb5c064f955d8e7f38fe0460c556a72987494ee17',
        pid: 52,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x33b0b883626c21ce5b3aad202bc435f876aee2c4',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        ableToFarm: true,
        pid: 53,
      },
    ],
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0xe503c1dfd7012e72af4c415f4c5e8abf5b45c25f',
        token0Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        pid: 54,
      },
    ],
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063-0xc2132d05d31c914a87c6611c10748aeb04b58e8f': [
      {
        type: Presets.STABLE,
        title: 'Stable',
        address: '0x45a3a657b834699f5cc902e796c547f826703b79',
        token0Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        token1Address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        ableToFarm: true,
        pid: 55,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x3fb73a554defa86b18f72e543aa2174a4d5f9621',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        ableToFarm: true,
        pid: 56,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2ef46196d7d25b5111ca1fcba206b248fee32d8d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        ableToFarm: true,
        pid: 57,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x0e9b89007eee9c958c0eda24ef70723c2c93dd58': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8557dac2a7724712f12952de3dabeef54459bd97',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x0e9b89007eee9c958c0eda24ef70723c2c93dd58',
        pid: 58,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x6a6d4d17c2e38d076264081676ffcdddf32c9715',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 59,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x972a53e2ee68d5c2b1614f65061815e06b1cce68',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        pid: 60,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x374c44443553d7eb86b5f77597cc67a507b19179',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed',
        ableToFarm: true,
        pid: 61,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x1ddae2e33c1d68211c5eae05948fd298e72c541a',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        ableToFarm: true,
        pid: 0,
        masterChefIndex: 1,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x172370d5cd63279efa6d502dab29171933a610af': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x33eeafa7ef22cd4468d65819b2fe30f170db5b69',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x172370d5cd63279efa6d502dab29171933a610af',
        ableToFarm: true,
        pid: 63,
      },
    ],
    '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x3da7e0320c04d88b71e0ada960aad3d21f10cadf',
        token0Address: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 64,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x5f528db1129488083434e1b96e9808e3c4c6ed83',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        pid: 65,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xec38621e72d86775a89c7422746de1f52bba5320': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x2385cb5590413b2cd1fae63e68886b9f2ce43a9a',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xec38621e72d86775a89c7422746de1f52bba5320',
        ableToFarm: true,
        pid: 66,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0xc2a45fe7d40bcac8369371b08419ddafd3131b4a': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xc89004ce7becd2b39c44260327a603885da119b5',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0xc2a45fe7d40bcac8369371b08419ddafd3131b4a',
        ableToFarm: true,
        pid: 67,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd125443f38a69d776177c2b9c041f462936f8218': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9c3e0445559e6de1fe6391e8e018dca02b480836',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xd125443f38a69d776177c2b9c041f462936f8218',
        ableToFarm: true,
        pid: 68,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xfea715ab7e1de3640cd0662f6af0f9b25934e753',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        ableToFarm: true,
        pid: 69,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x34ffbd9db6b9bd8b095a0d156de69a2ad2944666',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 70,
      },
    ],
    '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9dfdf32ae82c7e8ebc156ea28e6637b120e00d12',
        token0Address: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 71,
      },
    ],
    '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd-0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x9f19ad14cd941e29b0e7ed8f5a1003fae4993dcd',
        token0Address: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
        token1Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        ableToFarm: true,
        pid: 72,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x49dcc56354a5a4875fb5d8bd7e7073c4f8868618',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 73,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xc6dd68b546d696d5a31837b05065a151d6b6f892',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
        ableToFarm: true,
        pid: 74,
      },
    ],
    '0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd-0x2791bca1f2de4661ed88a30c99a7a9449aa84174': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x8Bb9247c8eFf487F7A13AB7E704F50904e91430D',
        token0Address: '0x0c9c7712c83b3c70e7c5e11100d33d9401bdf9dd',
        token1Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        ableToFarm: true,
        pid: 75,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0x6e4e624106cb12e168e6533f8ec7c82263358940': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x550fac19d0ff06725dcaf7721b2c97aba268e11f',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0x6e4e624106cb12e168e6533f8ec7c82263358940',
        ableToFarm: true,
        pid: 76,
      },
    ],
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x8089f11dadbabf175aea2415194a6a3a0575539d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb',
        ableToFarm: true,
        pid: 77,
      },
    ],
    '0x4b4327db1600b8b1440163f667e199cef35385f5-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_DYNAMIC,
        title: 'Pegged Price',
        address: '0x0668331b4606beb78a1c8314e08d8b07653fbd3c',
        token0Address: '0x4b4327db1600b8b1440163f667e199cef35385f5',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 78,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xffa188493c15dfaf2c206c97d8633377847b6a52': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xc491c1b173e932e97d9f739ccd9ae5b6d5fce4ce',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xffa188493c15dfaf2c206c97d8633377847b6a52',
        pid: 80,
      },
    ],
    '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x2d08b4b4c74d0b2f4144ae7bd86ee40fb654acef',
        token0Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        pid: 1,
        masterChefIndex: 1,
      },
    ],
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6-0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0xcbb7fae80e4f5c0cbfe1af7bb1f19692f9532cfa',
        token0Address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        token1Address: '0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6',
        pid: 2,
        masterChefIndex: 1,
      },
    ],
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174-0xa3fa99a148fa48d14ed51d610c367c61876997f1': [
      {
        type: Presets.GAMMA_STABLE,
        title: 'Stable',
        address: '0x25B186eEd64ca5FDD1bc33fc4CFfd6d34069BAec',
        token0Address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        token1Address: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        pid: 81,
        ableToFarm: true,
      },
    ],
    '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0xadfc52d48d68b235b6b9453ef5130fc6dfd2513e',
        token0Address: '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 82,
      },
    ],
    '0x58001cc1a9e17a20935079ab40b1b8f4fc19efd1-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x45a743cd8c58c96cbd566ece33c83698e2e49424',
        token0Address: '0x58001cc1a9e17a20935079ab40b1b8f4fc19efd1',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 84,
      },
    ],
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619-0xd6df932a45c0f255f85145f286ea0b292b21c90b': [
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x5ba383530db75a22e028239dbc777c7ee8ce4752',
        token0Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        token1Address: '0xd6df932a45c0f255f85145f286ea0b292b21c90b',
        ableToFarm: true,
        pid: 85,
      },
    ],
  },
  [ChainId.ROLLUX_TANENBAUM]: {
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270-0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': [
      {
        type: Presets.GAMMA_NARROW,
        title: 'Narrow',
        address: '0x02203f2351e7ac6ab5051205172d3f772db7d814',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 0,
      },
      {
        type: Presets.GAMMA_WIDE,
        title: 'Wide',
        address: '0x81cec323bf8c4164c66ec066f53cc053a535f03d',
        token0Address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        token1Address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        ableToFarm: true,
        pid: 1,
      },
    ],
  },
}

export const GlobalConst = {
  utils: {
    v3FarmSortBy: {
      pool: '1',
      tvl: '2',
      rewards: '3',
      apr: '4',
    },
    v3FarmFilter: {
      allFarms: '0',
      stableCoin: '1',
      blueChip: '2',
      stableLP: '3',
      otherLP: '4',
    },
  },
  v3LiquidityRangeType: {
    MANUAL_RANGE: '0',
    GAMMA_RANGE: '1',
  },
}

export enum FarmingType {
  ETERNAL = 0,
  LIMIT = 1,
}
