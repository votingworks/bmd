import { act } from '@testing-library/react'
import {
  CandidateContest,
  CompletedBallot,
  electionSample as election,
  vote,
} from '@votingworks/ballot-encoder'
import * as GLOBALS from '../../src/config/globals'
import { CardAPI, CardPresentAPI, VoterCardData } from '../../src/config/types'
import utcTimestamp from '../../src/utils/utcTimestamp'

const contest0 = election.contests[0] as CandidateContest
const contest1 = election.contests[1] as CandidateContest
const contest0candidate0 = contest0.candidates[0]
const contest1candidate0 = contest1.candidates[0]
const defaultBallotStyleId = election.precincts[1].id
const defaultPrecinctId = election.ballotStyles[1].id

export const sampleVotes = vote(election.contests, {
  president: [contest0candidate0],
  'question-a': 'no',
  'question-b': 'yes',
  senator: [contest1candidate0],
})

export const sampleBallot: CompletedBallot = {
  ballotId: 'test-ballot-id',
  ballotStyle: election.ballotStyles[0],
  election,
  precinct: election.precincts[0],
  votes: sampleVotes,
  isTestBallot: true,
}

export const noCard: CardAPI = {
  present: false,
}

export const adminCard: CardPresentAPI = {
  present: true,
  longValueExists: true,
  shortValue: JSON.stringify({
    t: 'clerk',
    h: 'abcd',
  }),
}

export const pollWorkerCard: CardPresentAPI = {
  present: true,
  shortValue: JSON.stringify({
    t: 'pollworker',
    h: 'abcd',
  }),
}

type CreateVoterCardConfig = Partial<VoterCardData> & {
  longValueExists?: boolean
}

export const createVoterCard = (
  config: CreateVoterCardConfig = {}
): CardPresentAPI => {
  const { longValueExists, ...cardData } = config
  return {
    present: true,
    longValueExists,
    shortValue: JSON.stringify({
      t: 'voter',
      c: utcTimestamp(),
      pr: election.precincts[0].id,
      bs: election.ballotStyles[0].id,
      ...cardData,
    }),
  }
}

export const getNewVoterCard = () => createVoterCard()

export const getAlternateNewVoterCard = () =>
  createVoterCard({
    pr: defaultPrecinctId,
    bs: defaultBallotStyleId,
  })

export const getVoidedVoterCard = () =>
  createVoterCard({
    uz: utcTimestamp(),
  })

export const getExpiredVoterCard = () =>
  createVoterCard({
    c: utcTimestamp() - GLOBALS.CARD_EXPIRATION_SECONDS,
  })

export const getExpiredVoterCardWithVotes = () =>
  createVoterCard({
    c: utcTimestamp() - GLOBALS.CARD_EXPIRATION_SECONDS,
    u: utcTimestamp(),
    longValueExists: true,
  })

export const getVoterCardWithVotes = () =>
  createVoterCard({
    u: utcTimestamp(),
    longValueExists: true,
  })

export const getUsedVoterCard = () =>
  createVoterCard({
    bp: utcTimestamp(),
  })

export const advanceTimers = (seconds: number = 0) => {
  const maxSeconds = GLOBALS.IDLE_TIMEOUT_SECONDS
  if (seconds > maxSeconds) {
    throw new Error(`Seconds value should not be greater than ${maxSeconds}`)
  }
  act(() => {
    jest.advanceTimersByTime(
      seconds ? seconds * 1000 : GLOBALS.CARD_POLLING_INTERVAL
    )
  })
}
