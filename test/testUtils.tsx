import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'
import { render as testRender } from 'react-testing-library'

import GLOBALS from '../src/config/globals'

import electionSample from '../src/data/electionSample.json'

import {
  CandidateContest,
  Election,
  TextSizeSetting,
  YesNoContest,
} from '../src/config/types'

import { mergeWithDefaults } from '../src/App'
import BallotContext from '../src/contexts/ballotContext'

export function render(
  component: React.ReactNode,
  {
    election = electionSample,
    contests = electionSample.contests as Array<
      CandidateContest | YesNoContest
    >,
    ballotStyle = '12D',
    precinct = 'precinct-23',
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    resetBallot = jest.fn(),
    setBallotKey = jest.fn(),
    setUserSettings = jest.fn(),
    updateVote = jest.fn(),
    userSettings = { textSize: GLOBALS.TEXT_SIZE as TextSizeSetting },
    votes = {},
  } = {}
) {
  return {
    ...testRender(
      <BallotContext.Provider
        value={{
          ballotStyle,
          contests,
          election: mergeWithDefaults(election as Election),
          precinct,
          resetBallot,
          setBallotKey,
          setUserSettings,
          updateVote,
          userSettings,
          votes,
        }}
      >
        <Router history={history}>{component}</Router>
      </BallotContext.Provider>
    ),
    history,
  }
}

export default undefined
