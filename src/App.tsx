import Mousetrap from 'mousetrap'
import React from 'react'
// @ts-ignore - @types/react-gamepad doesn't exist
import Gamepad from 'react-gamepad'
import { BrowserRouter, Route, RouteComponentProps } from 'react-router-dom'

import GLOBALS from './config/globals'

import 'normalize.css'
import './App.css'

import {
  handleGamepadButtonDown,
  handleGamepadKeyboardEvent,
} from './lib/gamepad'

import {
  CandidateContest,
  Election,
  ElectionDefaults,
  OptionalElection,
  OptionalVote,
  PartialUserSettings,
  TextSizeSetting,
  UserSettings,
  VotesDict,
  YesNoContest,
} from './config/types'

import electionDefaults from './data/electionDefaults.json'
import electionSample from './data/electionSample.json'

export const mergeWithDefaults = (
  election: Election,
  defaults: ElectionDefaults = electionDefaults
) => ({ ...defaults, ...election })

import Ballot from './components/Ballot'
import Screen from './components/Screen'
import UploadConfig from './components/UploadConfig'
import BallotContext from './contexts/ballotContext'

interface State {
  ballotKey: string
  contests: Array<CandidateContest | YesNoContest>
  precinct: string
  ballotStyle: string
  election: OptionalElection
  userSettings: UserSettings
  votes: VotesDict
}

export const electionKey = 'votingWorksElection'
const removeElectionShortcuts = ['mod+k']

const initialState = {
  ballotKey: '',
  ballotStyle: '',
  contests: [],
  election: undefined,
  precinct: '',
  userSettings: {
    textSize: GLOBALS.TEXT_SIZE as TextSizeSetting,
  },
  votes: {},
}

function filterContests(election: Election, ballotStyle: string) {
  const { ballotStyles, contests, districts } = election!
  const ballotStyleDetails = ballotStyles!.find(x => x.id === ballotStyle)!
  if (!ballotStyleDetails) {
    return contests
  }

  const relevantDistrictIds = districts
    .filter(district => ballotStyleDetails.districts.includes(district.id))
    .map(district => district.id)
  const availableContests = contests.filter(contest =>
    relevantDistrictIds.includes(contest.district_id)
  )

  return availableContests
}

function parseBallotKey(ballotKey: string) {
  const ballotKeyComponents = ballotKey.split('.')
  if (ballotKeyComponents.length !== 3 || ballotKeyComponents[0] !== 'VX') {
    return { precinct: '', ballotStyle: '' }
  }

  const [precinct, ballotStyle] = ballotKeyComponents.slice(1)

  return {
    ballotStyle,
    precinct,
  }
}

class App extends React.Component<RouteComponentProps, State> {
  public state: State = initialState

  public componentDidCatch() {
    this.reset()
    window.location.reload()
  }

  public componentDidMount = () => {
    if (window.location.hash === '#sample') {
      this.setState({
        election: mergeWithDefaults(electionSample as Election),
      })
    } else {
      this.setState({
        election: this.getElection(),
      })
    }
    Mousetrap.bind(removeElectionShortcuts, this.reset)
    document.addEventListener('keydown', handleGamepadKeyboardEvent)
    document.documentElement.setAttribute('data-useragent', navigator.userAgent)
    this.setDocumentFontSize()
  }

  public componentWillUnount = /* istanbul ignore next */ () => {
    Mousetrap.unbind(removeElectionShortcuts)
    document.removeEventListener('keydown', handleGamepadKeyboardEvent)
  }

  public getElection = (): OptionalElection => {
    const election = window.localStorage.getItem(electionKey)
    return election ? JSON.parse(election) : undefined
  }

  public setElection = (electionConfigFile: Election) => {
    const election = mergeWithDefaults(electionConfigFile)
    this.setState({ election })
    window.localStorage.setItem(electionKey, JSON.stringify(election))
  }

  public reset = /* istanbul ignore next */ () => {
    this.setState(initialState)
    window.localStorage.removeItem(electionKey)
    this.props.history.push('/')
  }

  public updateVote = (contestId: string, vote: OptionalVote) => {
    this.setState(prevState => ({
      votes: { ...prevState.votes, [contestId]: vote },
    }))
  }

  public resetBallot = (path: string = '/') => {
    this.setState(
      {
        ...initialState,
        election: this.getElection(),
      },
      () => {
        this.props.history.push(path)
      }
    )
  }

  public setBallotKey = (ballotKey: string) => {
    const { precinct, ballotStyle } = parseBallotKey(ballotKey)
    const contests = filterContests(this.state.election!, ballotStyle)

    this.setState({
      ballotKey,
      ballotStyle,
      contests,
      precinct,
    })
  }

  public setUserSettings = (partial: PartialUserSettings) => {
    this.setState(
      {
        userSettings: { ...this.state.userSettings, ...partial },
      },
      () => {
        const { textSize } = partial
        const isValidTextSize =
          'textSize' in partial &&
          typeof textSize === 'number' &&
          textSize >= 0 &&
          textSize <= GLOBALS.FONT_SIZES.length - 1
        /* istanbul ignore else */
        if (isValidTextSize) {
          this.setDocumentFontSize(textSize!)
        }
      }
    )
  }

  public setDocumentFontSize = (textSize: number = GLOBALS.TEXT_SIZE) => {
    document.documentElement.style.fontSize = `${
      GLOBALS.FONT_SIZES[textSize]
    }px`
  }

  public render() {
    const { election } = this.state
    if (!election) {
      return <UploadConfig setElection={this.setElection} />
    } else {
      return (
        <Gamepad onButtonDown={handleGamepadButtonDown}>
          <BallotContext.Provider
            value={{
              ballotStyle: this.state.ballotStyle,
              contests: this.state.contests,
              election,
              precinct: this.state.precinct,
              resetBallot: this.resetBallot,
              setBallotKey: this.setBallotKey,
              setUserSettings: this.setUserSettings,
              updateVote: this.updateVote,
              userSettings: this.state.userSettings,
              votes: this.state.votes,
            }}
          >
            <Ballot />
          </BallotContext.Provider>
        </Gamepad>
      )
    }
  }
}

const Root = () => (
  <BrowserRouter>
    <Screen>
      <Route path="/" component={App} />
    </Screen>
  </BrowserRouter>
)

export default Root
