import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import QRCode from '../components/QRCode'
import Seal from '../components/Seal'
import { encryptAndGetTracker } from '../endToEnd'

import ButtonBar from '../components/ButtonBar'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import BallotContext from '../contexts/ballotContext'

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
  width: 6rem;
  padding-right: 1rem;
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

interface State {
  tracker: string
}

class TrackerPage extends React.Component<RouteComponentProps, State> {
  public static contextType = BallotContext

  public state: State = {
    tracker: '',
  }

  public numStepImagesLoaded = 0

  public componentDidMount = async () => {
    window.addEventListener('afterprint', this.resetBallot)
    const {
      election: { votes },
    } = this.context

    const tracker = await encryptAndGetTracker(votes)
    this.setState({ tracker })
  }

  public componentWillUnmount = () => {
    window.removeEventListener('afterprint', this.resetBallot)
  }

  public resetBallot = () => {
    // Putting it back into event loop because infinite recursion otherwise.
    // TODO: figure out a cleaner way to do this.
    window.setTimeout(() => {
      this.context.resetBallot('/cast')
    }, 100)
  }

  public stepImageLoaded = () => {
    this.numStepImagesLoaded += 1

    if (this.numStepImagesLoaded === 3) {
      window.print()
    }
  }

  public render() {
    const {
      election: { seal, sealURL, title, county, state, date },
    } = this.context

    const { tracker } = this.state

    if (!tracker) {
      return <React.Fragment>Generating tracker...</React.Fragment>
    }

    const trackerChunks = tracker.split(' ')
    const boldTrackerChunk = trackerChunks.slice(0, 2).join(' ')
    const restTracker = trackerChunks.slice(2).join(' ')

    return (
      <React.Fragment>
        <Main>
          <MainChild>
            <Prose className="no-print">
              <h1 aria-label="Print your tracker.">
                Now printing your tracker...
              </h1>
              <p>Hold on just a few seconds.</p>
            </Prose>
            <div aria-hidden="true" className="print-only">
              <Header>
                <Prose className="ballot-header-content">
                  <h1>Tracker</h1>
                  <h2>&#x279c; take this home with you</h2>
                </Prose>
              </Header>
              <Content>
                <Highlight>
                  <strong>
                    Use the unique tracking ID below to track your individual
                    ballot and see it’s been recorded.
                  </strong>{' '}
                  Although the contents of your ballot will always remain
                  secret, you can verify that the vote recorded was at the time
                  and place that you voted.
                </Highlight>
                <Divider />
                <Steps>
                  <div>
                    <img
                      onLoad={this.stepImageLoaded}
                      alt="Step 1"
                      src="/tracker-step1.svg"
                    />
                    <br />
                    <strong>Step 1</strong>: Put your ballot in a ballot box or
                    take it to a poll worker. Then take this page home with you.
                  </div>
                  <div>
                    <img
                      onLoad={this.stepImageLoaded}
                      alt="Step 2"
                      src="/tracker-step2.svg"
                    />
                    <br />
                    <strong>Step 2</strong>: After the polls close, go online to
                    track your ballot.
                  </div>
                  <div>
                    <img
                      onLoad={this.stepImageLoaded}
                      alt="Step 3"
                      src="/tracker-step3.svg"
                    />
                    <br />
                    <strong>Step 3</strong>: Your tracker ID will show public
                    information for you to confirm your ballot was counted.
                  </div>
                </Steps>
                <ThinDivider />
                <Large>
                  Visit <b>electionguard.vote</b> and either:
                </Large>
                <TrackerOptions>
                  <div>
                    Type the bold part below, then match the rest of the Tracker
                    ID:{' '}
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
                      <QRCode
                        value={`https://electionguard.vote/track/${tracker.replace(
                          / /g,
                          '-'
                        )}`}
                      />
                    </QRCodeContainer>
                  </div>
                </TrackerOptions>
                <ElectionDetails>
                  <SealContainer>
                    <Seal seal={seal} sealURL={sealURL} />
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
            </div>
          </MainChild>
        </Main>
        <ButtonBar />
        <ButtonBar secondary separatePrimaryButton>
          <div />
        </ButtonBar>
      </React.Fragment>
    )
  }
}

export default TrackerPage
