import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'

import {
  Candidate,
  CandidateContest,
  CandidateVote,
  OptionalYesNoVote,
  YesNoContest,
  YesNoVote,
} from '../config/types'

import { Barcode } from '../assets/BarCodes'
import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import LinkButton from '../components/LinkButton'
import Main, { MainChild } from '../components/Main'
import Modal from '../components/Modal'
import Prose from '../components/Prose'
import Text from '../components/Text'
import GLOBALS from '../config/globals'
import BallotContext from '../contexts/ballotContext'

const tabletMinWidth = 768

const Ballot = styled.section`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  padding: 1rem 0.5rem;
  background: white;
  @media (min-width: ${tabletMinWidth}px), print {
    margin-top: 2rem;
    padding: 2rem;
  }
  @media print {
    min-height: 11in;
    margin: 0;
    padding: 0.5in;
    font-size: 16px;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  align-items: center;
  text-align: center;
  @media (min-width: ${tabletMinWidth}px), print {
    text-align: left;
    flex-direction: row;
  }
  & > .seal {
    width: 150px;
    align-self: flex-start;
    margin: 0 auto 0.5rem;
    @media (min-width: ${tabletMinWidth}px), print {
      width: 175px;
      margin: 0;
    }
    @media print {
      width: 1.5in;
      margin: 0;
    }
  }
  & h2 {
    margin-bottom: 0;
  }
  & h3 {
    margin-top: 0;
  }
  & > .ballot-header-content {
    flex: 1;
    @media (min-width: ${tabletMinWidth}px), print {
      margin-left: 1rem;
    }
    @media (min-width: ${tabletMinWidth}px), print {
      max-width: 100%;
    }
  }
`

const BarCodeContainer = styled.div`
  margin: 1rem 0 -0.75rem;
  @media (min-width: 480px), print {
    width: 50%;
  }
`

const Content = styled.div`
  flex: 1;
`

const BallotSelections = styled.dl`
  border-bottom: 1px solid lightgrey;
  padding-bottom: 0.5rem;
`

const ContestHeader = styled.dt`
  margin-top: 0.5rem;
  border-top: 1px solid lightgrey;
  padding-top: 0.5rem;
  & > .change-button {
    float: right;
  }
`

const ContestHeading = styled.span`
  font-size: 0.8rem;
`

const ContestSelection = styled.dd`
  margin: 0;
  word-break: break-word;
`

const NoSelection = (props: { title: string }) => (
  <ContestSelection>
    <Text as="strong" muted aria-label={`No selection for ${props.title}.`}>
      [no selection]
    </Text>
  </ContestSelection>
)

const CandidateContestResult = (props: {
  contest: CandidateContest
  vote: CandidateVote
}) =>
  props.vote === undefined || props.vote.length === 0 ? (
    <NoSelection title={props.contest.title} />
  ) : (
    <React.Fragment>
      {props.vote.map(
        (candidate: Candidate, index: number, array: CandidateVote) => (
          <ContestSelection
            key={candidate.id}
            aria-label={`${candidate.name}${
              candidate.party ? `, ${candidate.party}` : ''
            }${candidate.isWriteIn ? `, write-in` : ''}${
              array.length - 1 === index ? '.' : ','
            }`}
          >
            <strong>{candidate.name}</strong>{' '}
            {candidate.party && `/ ${candidate.party}`}
            {candidate.isWriteIn && `(write-in)`}
          </ContestSelection>
        )
      )}
    </React.Fragment>
  )

const YesNoContestResult = (props: {
  contest: YesNoContest
  vote: OptionalYesNoVote
}) =>
  props.vote ? (
    <ContestSelection>
      <Text as="strong">{GLOBALS.YES_NO_VOTES[props.vote]}</Text>
    </ContestSelection>
  ) : (
    <NoSelection title={props.contest.title} />
  )

interface State {
  showConfirmModal: boolean
}

class SummaryPage extends React.Component<RouteComponentProps, State> {
  public static contextType = BallotContext
  public state: State = {
    showConfirmModal: false,
  }
  public componentDidMount = () => {
    window.addEventListener('afterprint', this.resetBallot)
  }
  public componentWillUnmount = () => {
    window.removeEventListener('afterprint', this.resetBallot)
  }
  public resetBallot = () => {
    this.context.resetBallot('/cast')
  }
  public hideConfirm = () => {
    this.setState({ showConfirmModal: false })
  }
  public showConfirm = () => {
    this.setState({ showConfirmModal: true })
  }
  public render() {
    const { seal, title, county, state, date } = this.context.election
    return (
      <React.Fragment>
        <Main>
          <MainChild>
            <Prose>
              <h1 className="no-print" aria-label={`Review Your Selections.`}>
                Review Your Selections
              </h1>
              <p className="no-print">
                Confirm your votes by printing your ballot.
              </p>
            </Prose>
            <Ballot>
              <Header>
                <div
                  className="seal"
                  dangerouslySetInnerHTML={{ __html: seal }}
                />
                <Prose className="ballot-header-content">
                  <h2 aria-label={`Official Ballot.`}>Official Ballot</h2>
                  <h3 aria-label={`${title}.`}>{title}</h3>
                  <p aria-label={`${date}. ${county}, ${state}.`}>
                    {date}
                    <br />
                    {county}, {state}
                  </p>
                </Prose>
              </Header>
              <Content>
                <BallotSelections>
                  <BallotContext.Consumer>
                    {({ election, votes }) =>
                      election!.contests.map(contest => {
                        return (
                          <React.Fragment key={contest.id}>
                            <ContestHeader>
                              <ContestHeading aria-label={`${contest.title},`}>
                                {contest.title}
                              </ContestHeading>
                              <LinkButton
                                to={`/contests/${contest.id}`}
                                className="no-print change-button"
                                aria-label={`Change ${contest.title}.`}
                              >
                                Change
                              </LinkButton>
                            </ContestHeader>

                            {contest.type === 'candidate' && (
                              <CandidateContestResult
                                contest={contest}
                                vote={votes[contest.id] as CandidateVote}
                              />
                            )}
                            {contest.type === 'yesno' && (
                              <YesNoContestResult
                                contest={contest}
                                vote={votes[contest.id] as YesNoVote}
                              />
                            )}
                          </React.Fragment>
                        )
                      })
                    }
                  </BallotContext.Consumer>
                </BallotSelections>
              </Content>
              <BarCodeContainer aria-hidden="true">
                <Barcode />
              </BarCodeContainer>
            </Ballot>
          </MainChild>
        </Main>
        <ButtonBar separatePrimaryButton>
          <LinkButton goBack id="previous">
            Back
          </LinkButton>

          <div />
          <Button primary onClick={this.showConfirm}>
            Print Ballot
          </Button>
        </ButtonBar>
        <Modal
          isOpen={this.state.showConfirmModal}
          centerContent
          content={
            <Prose>
              <Text center>Are you finished voting?</Text>
            </Prose>
          }
          actions={
            <>
              <Button primary onClick={window.print}>
                Yes, I‘m finished. Print ballot.
              </Button>
              <Button onClick={this.hideConfirm}>No. Go Back.</Button>
            </>
          }
        />
      </React.Fragment>
    )
  }
}

export default SummaryPage
