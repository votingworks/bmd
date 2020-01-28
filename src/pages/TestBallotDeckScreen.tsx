import React, { PointerEventHandler, useState } from 'react'
import pluralize from 'pluralize'
import {
  VotesDict,
  CandidateContest,
  Election,
} from '@votingworks/ballot-encoder'

import { AppModeNames } from '../config/types'

import Button from '../components/Button'
import ButtonList from '../components/ButtonList'
import ElectionInfo from '../components/ElectionInfo'
import Main, { MainChild } from '../components/Main'
import PrintedBallot from '../components/PrintedBallot'
import Prose from '../components/Prose'
import Sidebar from '../components/Sidebar'
import Screen from '../components/Screen'
import { randomBase64 } from '../utils/random'

interface Ballot {
  ballotId?: string
  precinctId: string
  ballotStyleId: string
  votes: VotesDict
}

interface GenerateTestDeckParams {
  election: Election
  precinctId?: string
}

const generateTestDeckBallots = ({
  election,
  precinctId,
}: GenerateTestDeckParams) => {
  const precincts: string[] = precinctId
    ? [precinctId]
    : election.precincts.map(p => p.id)

  const ballots: Ballot[] = []

  precincts.forEach(precinctId => {
    const precinct = election.precincts.find(p => p.id === precinctId)!
    const precinctBallotStyles = election.ballotStyles.filter(bs =>
      bs.precincts.includes(precinct.id)
    )

    precinctBallotStyles.forEach(ballotStyle => {
      const contests = election.contests.filter(
        c =>
          ballotStyle.districts.includes(c.districtId) &&
          ballotStyle.partyId === c.partyId
      )

      const numBallots = Math.max(
        ...contests.map(c =>
          c.type === 'yesno' ? 2 : (c as CandidateContest).candidates.length
        )
      )

      for (let ballotNum = 0; ballotNum < numBallots; ballotNum++) {
        const votes: VotesDict = {}
        contests.forEach(contest => {
          /* istanbul ignore else */
          if (contest.type === 'yesno') {
            votes[contest.id] = ballotNum % 2 === 0 ? 'yes' : 'no'
          } else if (
            contest.type === 'candidate' &&
            contest.candidates.length > 0 // safety check
          ) {
            votes[contest.id] = [
              contest.candidates[ballotNum % contest.candidates.length],
            ]
          }
        })
        ballots.push({
          ballotStyleId: ballotStyle.id,
          precinctId,
          votes,
        })
      }
    })
  })

  return ballots
}

interface Precinct {
  name: string
  id: string
}

interface Props {
  appName: AppModeNames
  appPrecinctId: string
  election: Election
  hideTestDeck: () => void
  isLiveMode: boolean
}

const initialPrecinct: Precinct = { id: '', name: '' }

const TestBallotDeckScreen = ({
  appName,
  appPrecinctId,
  election,
  hideTestDeck,
  isLiveMode,
}: Props) => {
  const [ballots, setBallots] = useState<Ballot[]>([])
  const [precinct, setPrecinct] = useState<Precinct>(initialPrecinct)

  const selectPrecinct: PointerEventHandler = event => {
    const { id = '', name = '' } = (event.target as HTMLElement).dataset
    setPrecinct({ name, id })
    const selectedBallots = generateTestDeckBallots({
      election,
      precinctId: id,
    })
    setBallots(selectedBallots)
  }

  const resetDeck = () => {
    setBallots([])
    setPrecinct(initialPrecinct)
  }

  return (
    <React.Fragment>
      <Screen flexDirection="row-reverse" voterMode={false}>
        <Main padded>
          <MainChild maxWidth={false}>
            {ballots.length ? (
              <Prose className="no-print">
                <h1>Test Ballot Decks</h1>
                <p>
                  Deck containing{' '}
                  <strong>{pluralize('ballot', ballots.length, true)}</strong>{' '}
                  for {precinct.name}.
                </p>
                <p>
                  <Button big primary onPress={window.print}>
                    Print {ballots.length} ballots
                  </Button>
                </p>
                <p>
                  <Button small onPress={resetDeck}>
                    Back to Precincts List
                  </Button>
                </p>
              </Prose>
            ) : (
              <React.Fragment>
                <Prose>
                  <h1>Test Ballot Decks</h1>
                  <p>Select desired precinct.</p>
                </Prose>
                <p>
                  <Button
                    data-id=""
                    data-name="All Precincts"
                    fullWidth
                    key="all-precincts"
                    onPress={selectPrecinct}
                  >
                    <strong>All Precincts</strong>
                  </Button>
                </p>
                <ButtonList data-testid="precincts">
                  {election.precincts.map(p => (
                    <Button
                      data-id={p.id}
                      data-name={p.name}
                      fullWidth
                      key={p.id}
                      onPress={selectPrecinct}
                    >
                      {p.name}
                    </Button>
                  ))}
                </ButtonList>
              </React.Fragment>
            )}
          </MainChild>
        </Main>
        <Sidebar
          appName={appName}
          centerContent
          title="Election Admin Actions"
          footer={
            election && (
              <ElectionInfo
                election={election}
                precinctId={appPrecinctId}
                horizontal
              />
            )
          }
        >
          <Button small onPress={hideTestDeck}>
            Back to Admin Dashboard
          </Button>
        </Sidebar>
      </Screen>
      {ballots.length &&
        ballots.map((ballot, i) => (
          <PrintedBallot
            // eslint-disable-next-line react/no-array-index-key
            key={`ballot-${i}`}
            ballotId={randomBase64()}
            ballotStyleId={ballot.ballotStyleId}
            election={election}
            isLiveMode={isLiveMode}
            precinctId={ballot.precinctId}
            votes={ballot.votes}
          />
        ))}
    </React.Fragment>
  )
}

export default TestBallotDeckScreen
