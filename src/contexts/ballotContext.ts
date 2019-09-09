import { createContext } from 'react'
import * as GLOBALS from '../config/globals'

import {
  BallotContextInterface,
  TextSizeSetting,
  VxMarkOnly,
} from '../config/types'

const ballot: BallotContextInterface = {
  activateBallot: () => undefined,
  appMode: VxMarkOnly,
  ballotStyleId: '',
  contests: [],
  election: undefined,
  incrementBallotsPrintedCount: () => undefined,
  isLiveMode: false,
  markVoterCardUsed: async () => false,
  precinctId: '',
  resetBallot: () => undefined,
  setUserSettings: () => undefined,
  updateVote: () => undefined,
  userSettings: { textSize: GLOBALS.TEXT_SIZE as TextSizeSetting },
  votes: {},
}

const BallotContext = createContext(ballot)

export default BallotContext
