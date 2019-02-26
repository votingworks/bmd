import Mousetrap from 'mousetrap'
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { BrowserRouter, Route } from 'react-router-dom'

// Enable to view the event atrributes
// document.addEventListener('keydown', event => {
//   console.log('==============================')
//   console.log('==============================')
//   console.log('==============================')
//   console.log('Event:', event)
//   console.log('Keyboard Event object keys:', {
//     charCode: event.charCode,
//     code: event.code,
//     key: event.key,
//     keyCode: event.keyCode,
//     metaKey: event.metaKey,
//   })
//   console.log('==============================')
//   console.log('==============================')
//   console.log('==============================')
// })

import 'normalize.css'
import './App.css'

import {
  Election,
  OptionalCandidate,
  OptionalElection,
  VoteDict,
} from './config/types'

import sampleElection from './data/election.json'

import Ballot from './components/Ballot'
import UploadConfig from './components/UploadConfig'
import BallotContext from './contexts/ballotContext'

interface State {
  ballotKey: string
  election: OptionalElection
  votes: VoteDict
}

export const electionKey = 'votingWorksElection'
const removeElectionShortcuts = ['mod+k']

const initialState = {
  ballotKey: '',
  election: undefined,
  votes: {},
}

class App extends React.Component<RouteComponentProps, State> {
  public state: State = initialState

  public componentDidMount = () => {
    if (window.location.hash === '#sample') {
      this.setState({
        election: sampleElection,
      })
    } else {
      this.setState({
        election: this.getElection(),
      })
    }
    Mousetrap.bind(removeElectionShortcuts, this.reset)
  }

  public componentWillUnount = /* istanbul ignore next */ () => {
    Mousetrap.unbind(removeElectionShortcuts)
  }

  public getElection = () => {
    const election = window.localStorage.getItem(electionKey)
    return election ? JSON.parse(election) : undefined
  }

  public setElection = (election: Election) => {
    this.setState({ election })
    window.localStorage.setItem(electionKey, JSON.stringify(election))
  }

  public reset = /* istanbul ignore next */ () => {
    this.setState(initialState)
    window.localStorage.removeItem(electionKey)
    this.props.history.push('/')
  }

  public updateVote = (contestId: string, candidate: OptionalCandidate) => {
    this.setState(prevState => ({
      votes: Object.assign({}, prevState.votes, { [contestId]: candidate }),
    }))
  }

  public resetBallot = () => {
    this.setState({
      votes: {},
    })
    this.props.history.push('/')
  }

  public setBallotKey = (ballotKey: string) => {
    this.setState({
      ballotKey,
    })
  }

  public render() {
    const { election } = this.state
    if (!election) {
      return <UploadConfig setElection={this.setElection} />
    } else {
      return (
        <BallotContext.Provider
          value={{
            election,
            resetBallot: this.resetBallot,
            setBallotKey: this.setBallotKey,
            updateVote: this.updateVote,
            votes: this.state.votes,
          }}
        >
          <Ballot />
        </BallotContext.Provider>
      )
    }
  }
}

const Root = () => (
  <BrowserRouter>
    <Route path="/" component={App} />
  </BrowserRouter>
)

export default Root
