import React, { PointerEventHandler, useState } from 'react'
import pluralize from 'pluralize'
import { VotesDict, Election } from '@votingworks/ballot-encoder'

import { AppModeNames } from '../config/types'

import Button from '../components/Button'
import ButtonList from '../components/ButtonList'
import ElectionInfo from '../components/ElectionInfo'
import Main, { MainChild } from '../components/Main'
import HandMarkedPaperBallot from '../components/HandMarkedPaperBallot'
import Prose from '../components/Prose'
import Sidebar from '../components/Sidebar'
import Screen from '../components/Screen'

interface PaperBallot {
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

  const ballots: PaperBallot[] = []

  precincts.forEach(precinctId => {
    const precinct = election.precincts.find(p => p.id === precinctId)!
    const precinctBallotStyles = election.ballotStyles.filter(bs =>
      bs.precincts.includes(precinct.id)
    )
    precinctBallotStyles.forEach(ballotStyle => {
      ballots.push({
        ballotStyleId: ballotStyle.id,
        precinctId,
        votes: {},
      })
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
  hidePaperDeck: () => void
  isLiveMode: boolean
}

const initialPrecinct: Precinct = { id: '', name: '' }

const HandMarkedPaperBallotDeckScreen = ({
  appName,
  appPrecinctId,
  election,
  hidePaperDeck,
  isLiveMode,
}: Props) => {
  const [ballots, setBallots] = useState<PaperBallot[]>([])
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
                <h1>Hand-Marked Paper Ballots</h1>
                <p>
                  Deck containing{' '}
                  <strong>{pluralize('ballot', ballots.length, true)}</strong>{' '}
                  for {precinct.name}.
                </p>
                <p>
                  <Button big primary onPress={(window.kiosk ?? window).print}>
                    Print {pluralize('ballot', ballots.length, true)}
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
                  <h1>Hand-Marked Paper Ballots</h1>
                  <p>Select precinct to filter ballot styles by precinct.</p>
                </Prose>
                <p>
                  <Button
                    data-id=""
                    data-name="All Ballot Styles"
                    fullWidth
                    key="all-precincts"
                    onPress={selectPrecinct}
                  >
                    <strong>
                      All Ballot Styles ({election.ballotStyles.length})
                    </strong>
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
          <Button small onPress={hidePaperDeck}>
            Back to Admin Dashboard
          </Button>
        </Sidebar>
      </Screen>
      {!!ballots.length &&
        ballots.map((ballot, i) => (
          // <div
          //   // eslint-disable-next-line react/no-array-index-key
          //   key={`ballot-${i}`}
          // >
          //   {JSON.stringify({
          //     ballotStyleId: ballot.ballotStyleId,
          //     precinctId: ballot.precinctId,
          //   })}
          // </div>
          <HandMarkedPaperBallot
            // eslint-disable-next-line react/no-array-index-key
            key={`ballot-${i}`}
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

export default HandMarkedPaperBallotDeckScreen
