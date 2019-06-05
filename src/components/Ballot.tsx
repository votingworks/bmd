import React, { useContext, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import IdleTimer from 'react-idle-timer'

import BallotContext from '../contexts/ballotContext'

import CastBallotPage from '../pages/CastBallotPage'
import ContestPage from '../pages/ContestPage'
import HelpPage from '../pages/HelpPage'
import IdlePage from '../pages/IdlePage'
import NotFoundPage from '../pages/NotFoundPage'
import PreReviewPage from '../pages/PreReviewPage'
import PrintPage from '../pages/PrintPage'
import ReviewPage from '../pages/ReviewPage'
import SettingsPage from '../pages/SettingsPage'
import StartPage from '../pages/StartPage'
import InstructionsPage from '../pages/InstructionsPage'

const Ballot = () => {
  const [isIdle, setIsIdle] = useState(false)

  const { contests, election } = useContext(BallotContext)
  const { showHelpPage, showSettingsPage } = election!.bmdConfig!

  const onActive = () => {
    // a timeout because otherwise the click handler is passed to the candidate page
    window.setTimeout(() => {
      setIsIdle(false)
    }, 10)
  }

  const onIdle = () => {
    setIsIdle(true)
  }

  return (
    <IdleTimer
      element={document}
      onActive={onActive}
      onIdle={onIdle}
      debounce={250}
      timeout={5 * 1000}
    >
      {isIdle ? (
        <Switch>
          <Route path="/" component={IdlePage} />
          <Route path="/:path" component={IdlePage} />
        </Switch>
      ) : (
        <Switch>
          <Route path="/" exact component={StartPage} />
          <Route path="/instructions" exact component={InstructionsPage} />
          <Redirect
            exact
            from="/contests"
            to={contests.length ? '/contests/0' : '/'}
          />
          <Route path="/contests/:contestNumber" component={ContestPage} />
          <Route path="/pre-review" component={PreReviewPage} />
          <Route path="/review" component={ReviewPage} />
          <Route path="/print" component={PrintPage} />
          <Route path="/cast" component={CastBallotPage} />
          {showHelpPage && <Route path="/help" component={HelpPage} />}
          {showSettingsPage && (
            <Route path="/settings" component={SettingsPage} />
          )}
          <Route path="/:path" component={NotFoundPage} />
        </Switch>
      )}
    </IdleTimer>
  )
}

export default Ballot
