import { act } from '@testing-library/react'
import * as GLOBALS from '../../src/config/globals'
import { CardAPI, Election } from '../../src/config/types'
import electionSample from '../../src/data/electionSample.json'
import utcTimestamp from '../../src/utils/utcTimestamp'

const election = electionSample as Election

export const noCard: Partial<CardAPI> = {
  present: false,
}

export const adminCard: CardAPI = {
  present: true,
  longValueExists: true,
  shortValue: JSON.stringify({
    t: 'clerk',
    h: 'abcd',
  }),
}

export const pollWorkerCard: CardAPI = {
  present: true,
  shortValue: JSON.stringify({
    t: 'pollworker',
    h: 'abcd',
  }),
}

const voterCardShortValue = {
  t: 'voter',
  c: utcTimestamp(),
  pr: election.precincts[0].id,
  bs: election.ballotStyles[0].id,
}

export const voterCard: CardAPI = {
  present: true,
  shortValue: JSON.stringify(voterCardShortValue),
}

export const altVoterCard: CardAPI = {
  present: true,
  shortValue: JSON.stringify({
    ...voterCardShortValue,
    pr: election.precincts[1].id,
    bs: election.ballotStyles[1].id,
  }),
}

export const invalidatedVoterCard: CardAPI = {
  present: true,
  shortValue: JSON.stringify({
    ...voterCardShortValue,
    uz: utcTimestamp(),
  }),
}

export const expiredVoterCard: CardAPI = {
  present: true,
  shortValue: JSON.stringify({
    ...voterCardShortValue,
    c: utcTimestamp() - GLOBALS.CARD_EXPIRATION_SECONDS,
  }),
}

export const getPrintedVoterCard = (): CardAPI => ({
  present: true,
  shortValue: JSON.stringify({
    ...voterCardShortValue,
    bp: 1,
    uz: utcTimestamp(),
  }),
})

export const advanceTimers = (ms: number = 0) => {
  act(() => {
    jest.advanceTimersByTime(ms + GLOBALS.CARD_POLLING_INTERVAL)
  })
}
