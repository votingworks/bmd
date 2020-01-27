import React from 'react'
import styled from 'styled-components'
import { Election } from '@votingworks/ballot-encoder'
import QRCode from './QRCode'

import Prose from './Prose'
import { NoWrap } from './Text'

const TrackerPage = styled.div`
  page-break-after: always;
  @media screen {
    display: none;
  }
`
const PreHeader = styled.div`
  margin: 0 auto 0.375in;
  text-align: center;
  white-space: nowrap;
  font-size: 1.75rem;
  font-weight: 600;
`

const TrackerBox = styled.div`
  border: 0.2rem solid #000000;
  padding: 2rem;
`
const TrackerID = styled.span`
  line-height: 1;
  font-family: monospace;
  font-size: 2rem;
`
const Content = styled.div`
  display: flex;
  padding: 2rem 0;
`
const Footer = styled.div`
  border-top: 0.1rem solid #000000;
  padding-top: 1rem;
`

const Step = styled.p`
  display: block;
`
const StepDetail = styled.span`
  display: flex;
  margin: 1rem 0 0 1rem;
`
const BrowserInstructions = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 4rem;
  border: 1px solid #000000;
  padding: 1rem 1.5rem;
  text-align: center;
  line-height: 1.5;
`

const ElectionGuardBallotTrackingCode = ({
  election,
  tracker,
}: {
  election: Election
  tracker: string
}) => {
  const { title, county, state, date } = election

  const trackingDisplayUrl = 'https://fulton.electionguard.vote'
  const trackingTemplateUrl = 'https://trackmyvote.org/t/<tracker_id>'

  const trackingCodeChunks = tracker.split(' ')
  const trackingChallenge = trackingCodeChunks.slice(0, 2).join(' ')
  const trackingResponse = trackingCodeChunks.slice(2).join(' ')

  const trackerSafeForEmbedding = tracker.replace(/ /g, '-')
  const trackerUrl = trackingTemplateUrl.replace(
    '<tracker_id>',
    trackerSafeForEmbedding
  )

  return (
    <TrackerPage>
      <PreHeader>
        This is your ballot tracking code. Take this with you.
      </PreHeader>
      <TrackerBox>
        <Prose maxWidth={false}>
          <h2>Track Your Ballot</h2>
          <Step>
            1. Scan this QR code with your smartphone:
            <StepDetail>
              <QRCode value={trackerUrl} size="2in" />
              <BrowserInstructions>
                Or, in a web browser, go to: <br />
                <NoWrap as="strong">{trackingDisplayUrl}</NoWrap>
                <br />
                Enter your ballot tracking code:
                <br />
                <TrackerID>{trackingChallenge}</TrackerID>
              </BrowserInstructions>
            </StepDetail>
          </Step>
          <Step>
            2. Confirm that the following response code is displayed:
            <StepDetail>
              <TrackerID>{trackingResponse}</TrackerID>
            </StepDetail>
          </Step>
        </Prose>
      </TrackerBox>
      <Content>
        <Prose>
          <h2>What is my ballot tracking code for?</h2>
          <p>
            You may use this unique ballot tracking code to confirm that your
            individual ballot has been received and tallied.
          </p>
          <h2>How do I use my ballot tracking code?</h2>
          <p>
            Cast your offical ballot in the ballot box and take this page with
            you. When the election results have been reported, visit{' '}
            <NoWrap as="strong">{trackingDisplayUrl}</NoWrap> and follow the
            instructions to enter your ballot tracking code.
          </p>
          <h2>Does this reveal any of the selections on my ballot?</h2>
          <p>No. The votes on your ballot will always remain confidential.</p>
        </Prose>
      </Content>
      <Footer>
        <Prose textCenter>
          <p>
            {date}, {title}, {county.name}, {state}
          </p>
        </Prose>
      </Footer>
    </TrackerPage>
  )
}

export default ElectionGuardBallotTrackingCode
