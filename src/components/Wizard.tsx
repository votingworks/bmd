import React from 'react'
import styled from 'styled-components'

import { WizardStep } from '../config/types'

import Main from './Main'

export interface WizardStepProps {
  disabled?: boolean
}

const WizardContainer = styled.ul`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
`
const StepContainer = styled.li`
  display: inline-block;
  padding: 0.5rem 0.5rem;
  list-style-type: none;
`
const StepNumber = styled.span<WizardStepProps>`
  display: block;
  border-radius: 3rem;
  background-color: ${props => (props.disabled ? '#c6d4dc' : '#388097')};
  padding: 1rem 1.5rem;
  line-height: 2rem;
  color: #ffffff;
  font-size: 2rem;
`
const StepComplete = styled.span`
  display: block;
  border-radius: 3rem;
  background-color: #ffffff;
  padding: 1rem 1.5rem;
  line-height: 2rem;
  color: #388097;
  font-size: 1.4rem;
`
const StepLabel = styled.span`
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 35rem;
  padding: 0.5rem 0.5rem;
  text-align: center;
`
const StepLine = styled.div`
  position: absolute;
  top: 2.5rem;
  right: 0;
  left: 2.5rem;
  z-index: -1;
  background-color: #c6d4dc;
  width: 80%;
  height: 0.5rem;
`

interface Props {
  steps: WizardStep[]
}

export const Wizard = (props: Props) => {
  const { steps } = props
  return (
    <Main noOverflow noPadding>
      <WizardContainer>
        <StepLine />
        {steps.map(step => {
          return (
            <StepContainer key={step.stepNumber}>
              {!step.isComplete && (
                <StepNumber {...!step.isActive && { disabled: true }}>
                  {step.stepNumber}
                </StepNumber>
              )}
              {step.isComplete && <StepComplete>✔</StepComplete>}
              <StepLabel>{step.label}</StepLabel>
            </StepContainer>
          )
        })}
      </WizardContainer>
    </Main>
  )
}
