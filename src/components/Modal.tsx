import React, { ReactNode } from 'react'
import ReactModal from 'react-modal'
import styled from 'styled-components'

import './Modal.css'

import ButtonBar from './ButtonBar'

interface ModalContentInterface {
  centerContent?: boolean
}

const ModalContent = styled('div')<ModalContentInterface>`
  flex: 1;
  display: flex;
  align-items: center;
  overflow: auto;
  padding: 1rem 0.5rem;
  justify-content: ${({ centerContent = false }) =>
    centerContent ? 'center' : undefined};
  @media (min-width: 480px) {
    padding: 2rem 1rem;
  }
`

interface Props {
  actions?: ReactNode
  ariaLabel?: string
  centerContent?: boolean
  content?: ReactNode
  isOpen: boolean
  onAfterOpen?: () => void
}

const Modal: React.FC<Props> = ({
  actions,
  ariaLabel = 'Alert Modal',
  centerContent,
  content,
  isOpen,
  onAfterOpen,
}: Props) => (
  <ReactModal
    appElement={document.getElementById('root')!}
    ariaHideApp={process.env.NODE_ENV !== 'test'}
    isOpen={isOpen}
    contentLabel={ariaLabel}
    portalClassName="modal-portal"
    className="modal-content"
    overlayClassName="modal-overlay"
    onAfterOpen={onAfterOpen}
  >
    <ModalContent centerContent={centerContent}>{content}</ModalContent>
    <ButtonBar as="div" dark={false}>
      {actions}
    </ButtonBar>
  </ReactModal>
)

export default Modal
