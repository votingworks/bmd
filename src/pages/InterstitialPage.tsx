import React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import ButtonBar from '../components/ButtonBar'
import LinkButton from '../components/LinkButton'
import { Wizard } from '../components/Wizard'
import { WizardStep } from '../config/types'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'

const PrimaryButton = styled(LinkButton)`
  padding: 1rem 2rem;
`

export interface InterstitialParams {
  step: string
}

export interface InterstitialDetails {
  description: string
  buttontext: string
  header: string
  url: string
}

const InterstitialSteps: { [key: string]: InterstitialDetails } = {
  '1': {
    description: `This is the ballot for the 2018 General Election.
                There are 14 contests and 7 measures.`,
    url: '/interstitial/2/',
    buttontext: 'Start Voting',
    header: 'Mark your ballot',
  },
  '2': {
    description: `Make sure everything is correct. You can change your selections on
            the review screen.`,
    url: '/interstitial/3/',
    buttontext: 'Review my selections',
    header: 'Review your selections',
  },
  '3': {
    description: `If you are done making your selections and reviewing them, you are now ready
            to print. This will take about 1 minute.`,
    url: '/interstitial/4/',
    buttontext: 'Print',
    header: 'Print your ballot',
  },
  '4': {
    description: `Check your printed ballot. If you find a mistake, ask 
    a poll worker for help.
    
    Tear off the tracker section 
    to take with you.
    
    Take the ballot 
    to the scanner to cast your vote.`,

    url: '/contests/',
    buttontext: 'OK',
    header: "You're almost done",
  },
}

const InterstitialPage = (props: RouteComponentProps<InterstitialParams>) => {
  const { step } = props.match.params

  const wizardSteps: WizardStep[] = [
    {
      label: 'Mark',
      stepNumber: 1,
      isActive: step === '1',
      isComplete: Number(step) > 1,
    },
    {
      label: 'Review',
      stepNumber: 2,
      isActive: step === '2',
      isComplete: Number(step) > 2,
    },
    {
      label: 'Print',
      stepNumber: 3,
      isActive: step === '3',
      isComplete: Number(step) > 3,
    },
    { label: 'Cast', stepNumber: 4, isActive: step === '4', isComplete: false },
  ]

  const { header, description, url, buttontext } = InterstitialSteps[step]

  return (
    <React.Fragment>
      <Main>
        <MainChild center>
          <Wizard steps={wizardSteps} />
          <Prose textCenter>
            <h1 aria-label={header}>{header}</h1>
            <p>{description}</p>
            <p>
              <PrimaryButton primary to={url}>
                {buttontext}
              </PrimaryButton>
            </p>
          </Prose>
        </MainChild>
      </Main>

      <ButtonBar secondary separatePrimaryButton>
        <div />
        <LinkButton to="/help">Help</LinkButton>
        <LinkButton to="/settings">Settings</LinkButton>
      </ButtonBar>
    </React.Fragment>
  )
}

export default InterstitialPage
