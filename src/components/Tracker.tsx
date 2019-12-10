import React from 'react'
import styled from 'styled-components'
import { Election } from '@votingworks/ballot-encoder'
import QRCode from './QRCode'

import Prose from './Prose'

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 0.75in;
  & h2 {
    margin-bottom: 0;
  }
  & h3 {
    margin-top: 0;
  }
  & > .ballot-header-content {
    flex: 1;
    margin: 0 1rem;
    max-width: 100%;
  }
`
const Content = styled.div`
  flex: 1;
  line-height: 1.2;
`

const Highlight = styled.div`
  background: #dddddd;
  padding: 20px;
`

const Divider = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  border-top: 0.3rem solid #000000;
  width: 100%;
`

const ThinDivider = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  border-top: 0.1rem solid #000000;
  width: 100%;
`

const VerticalDivider = styled.div`
  margin: auto;
  border: 0.1rem solid #000000;
  width: 4px;
  height: 80%;
`

const Large = styled.div`
  padding: 10px;
  font-size: 1.3em;
`

const TrackingID = styled.div`
  margin: 15px;
  border: 0.1rem solid #000000;
  padding: 20px;
  font-size: 0.9em;
`

const Steps = styled.div`
  display: grid;
  grid-template-columns: 33% 34% 33%;
  margin: auto;
  width: 100%;
  font-size: 0.9em;
  justify-items: center;
  & > div {
    padding-right: 60px;
    padding-left: 60px;
  }
  & > div > img {
    display: block;
    height: 10rem;
  }
`

const TrackerOptions = styled.div`
  display: grid;
  grid-template-columns: 55% 10% 35%;
  margin: auto;
  width: 100%;
  font-size: 1.3em;
  justify-items: center;
  & > div {
    padding: 10px 20px 20px 20px;
  }
`

const QRCodeContainer = styled.div`
  margin-top: 1rem;
  margin-right: 2rem;
  margin-left: 2rem;
  border: 0.1rem solid #000000;
  padding: 1rem;
`

const SealContainer = styled.div`
  float: left;
`

const SealImage = styled.img`
  max-width: 1in;
  padding-right: 10px;
`

const ElectionDetails = styled.div`
  float: right;
  margin-top: 1rem;
  margin-right: 1rem;
  width: 20rem;
  overflow: hidden;
  white-space: nowrap;
  font-size: 1em;
`

const Tracker = ({
  election,
  tracker,
}: {
  election: Election
  tracker: string
}) => {
  const { sealURL, title, county, state, date } = election

  const trackerSiteDisplay = 'trackMyVote.org'
  const trackerUrlTemplate = 'https://trackmyvote.org/t/<tracker_id>'

  const trackerChunks = tracker.split(' ')
  const boldTrackerChunk = trackerChunks.slice(0, 2).join(' ')
  const restTracker = trackerChunks.slice(2).join(' ')

  const trackerSafeForEmbedding = tracker.replace(/ /g, '-')
  const trackerUrl = trackerUrlTemplate.replace(
    '<tracker_id>',
    trackerSafeForEmbedding
  )

  return (
    <React.Fragment>
      <Header>
        <Prose className="print-only">
          <h1>Tracker</h1>
          <h2>&#x279c; take this home with you</h2>
        </Prose>
      </Header>
      <Content>
        <Highlight>
          <strong>
            Use the unique tracking ID below to track your individual ballot and
            see it’s been recorded.
          </strong>{' '}
          Although the contents of your ballot will always remain secret, you
          can verify that the vote recorded was at the time and place that you
          voted.
        </Highlight>
        <Divider />
        <Steps>
          <div>
            <img
              alt="Step 1"
              src="/tracker-step1.svg"
              data-testid="step1-img"
            />
            <br />
            <strong>Step 1</strong>: Put your ballot in a ballot box or take it
            to a poll worker. Then take this page home with you.
          </div>
          <div>
            <img
              alt="Step 2"
              src="/tracker-step2.svg"
              data-testid="step2-img"
            />
            <br />
            <strong>Step 2</strong>: After the polls close, go online to track
            your ballot.
          </div>
          <div>
            <img
              alt="Step 3"
              src="/tracker-step3.svg"
              data-testid="step3-img"
            />
            <br />
            <strong>Step 3</strong>: Your tracker ID will show public
            information for you to confirm your ballot was counted.
          </div>
        </Steps>
        <ThinDivider />
        <Large>
          Visit <b>{trackerSiteDisplay}</b> and either:
        </Large>
        <TrackerOptions>
          <div>
            Type the bold part below, then match the rest of the Tracker ID:{' '}
            <TrackingID>
              <strong>{boldTrackerChunk}</strong> {restTracker}
            </TrackingID>
          </div>
          <div>
            <b>OR</b>
            <br />
            <br />
            <VerticalDivider />
          </div>
          <div>
            Scan this tracker ID code:
            <br />
            <QRCodeContainer>
              <QRCode value={trackerUrl} />
            </QRCodeContainer>
          </div>
        </TrackerOptions>
        <ElectionDetails>
          <SealContainer>
            <SealImage src={sealURL} alt="" />
          </SealContainer>
          <strong>{title}</strong>
          <br />
          {date}
          <br />
          <strong>{county.name}</strong>
          <br />
          {state}
        </ElectionDetails>
      </Content>
    </React.Fragment>
  )
}

export default Tracker
