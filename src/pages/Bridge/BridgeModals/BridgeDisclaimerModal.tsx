import React from 'react'
import { ArrowRightCircle } from 'react-feather'
import styled from 'styled-components'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import { TYPE } from '../../../theme'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px 12px 12px;
  background: #181920;
`

const TitleWrapper = styled.div`
  margin: 10px 0px;
`

interface BridgeDisclaimerModalProps extends ModalProps {
  onConfirm: () => void
  amount: string
  assetType: string
  fromNetworkName: string
  toNetworkName: string
  txType: string
  textInfo: string
}

export const BridgeDisclaimerModal = ({
  isOpen,
  onConfirm,
  onDismiss,
  amount,
  assetType,
  fromNetworkName,
  toNetworkName,
  txType,
  textInfo
}: BridgeDisclaimerModalProps) => (
  <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
    <Wrapper>
      <ArrowRightCircle strokeWidth={0.5} size={75} color="#0E9F6E" />
      <TitleWrapper>
        <TYPE.body fontSize="22px" fontWeight="500" color="text1" textAlign="center">
          {txType} {amount} {assetType}
        </TYPE.body>
      </TitleWrapper>
      <TYPE.main mb="16px" fontSize="16px" fontWeight="600" color="#EBE9F8" textAlign="center" lineHeight="1.6">
        You are about to {txType} {amount} {assetType} from <br /> {fromNetworkName} to {toNetworkName}
      </TYPE.main>
      <TYPE.small mb="24px" textAlign="center" fontSize="14px" lineHeight="1.6">
        {textInfo}
        Would you like to proceed?
      </TYPE.small>
      <ButtonPrimary mb="12px" onClick={onConfirm}>
        CONFIRM
      </ButtonPrimary>
      <ButtonSecondary onClick={onDismiss}>CANCEL</ButtonSecondary>
    </Wrapper>
  </Modal>
)
