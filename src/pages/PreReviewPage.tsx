import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import ButtonBar from '../components/ButtonBar'
import LinkButton from '../components/LinkButton'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import BallotContext from '../contexts/ballotContext'

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
    const { bmdConfig } = this.context.election
    const { showHelpPage, showSettingsPage } = bmdConfig
    return (
      <React.Fragment>
        <Main>
          <MainChild>
            <Prose className="no-print">
              <h1 aria-label={`Pre Review Screen.`}>Pre Review Screen</h1>
              <p>Time to go into review mode.</p>
            </Prose>
          </MainChild>
        </Main>
        <ButtonBar>
          <LinkButton to="/review" id="next">
            Next
          </LinkButton>
          <LinkButton goBack id="previous">
            Back
          </LinkButton>
          <div />
          <div />
        </ButtonBar>
        <ButtonBar
          secondary
          separatePrimaryButton
          centerOnlyChild={!showHelpPage && !showSettingsPage && false}
        >
          <div />
          {showHelpPage && <LinkButton to="/help">Help</LinkButton>}
          {showSettingsPage && <LinkButton to="/settings">Settings</LinkButton>}
        </ButtonBar>
      </React.Fragment>
    )
  }
}

export default SummaryPage
