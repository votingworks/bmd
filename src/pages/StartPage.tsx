import React, { useContext } from 'react'
import styled from 'styled-components'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import BallotContext from '../contexts/ballotContext'

import { getPartyPrimaryAdjectiveFromBallotStyle } from '../utils/election'

import { Wobble } from '../components/Animations'
import ElectionInfo from '../components/ElectionInfo'
import LinkButton from '../components/LinkButton'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Sidebar from '../components/Sidebar'
import Screen from '../components/Screen'
import SettingsTextSize from '../components/SettingsTextSize'

const SidebarSpacer = styled.div`
  height: 90px;
`
const StartInstructions = styled.div`
  margin: 2rem auto 0;
  border-radius: 0.25rem;
  box-shadow: 0 0 4px #9c9c9c;
  background: #ffffff;
  max-width: 23rem;
  padding: 1rem;
  & small ul {
    margin: 0;
  }
`

type Props = RouteComponentProps<{}>

const StartPage = ({ history }: Props) => {
  const {
    ballotStyleId,
    contests,
    election,
    precinctId,
    setUserSettings,
    userSettings,
    forceSaveVote,
  } = useContext(BallotContext)
  const { title } = election
  const partyPrimaryAdjective = getPartyPrimaryAdjectiveFromBallotStyle({
    election,
    ballotStyleId,
  })

  const onStart = () => {
    forceSaveVote()
    history.push('/contests/0')
  }

  return (
    <Screen>
      <Main>
        <MainChild center>
          <Prose textCenter>
            <h1 aria-label={`${partyPrimaryAdjective} ${title}.`}>
              {partyPrimaryAdjective} {title}
            </h1>
            <hr />
            <p>
              <span>
                Your ballot has <strong>{contests.length} contests</strong>.
              </span>
              <span className="screen-reader-only">
                When voting with the text-to-speech audio, use the accessible
                controller to navigate your ballot. To navigate through the
                contests, use the left and right buttons. To navigate through
                contest choices, use the up and down buttons. To select or
                unselect a contest choice as your vote, use the select button.
              </span>
            </p>
          </Prose>
          <StartInstructions>
            <Prose>
              <small>
                <ul>
                  <li>To vote for a name on the ballot, select the name.</li>
                  <li>
                    To vote for a name which is not on the ballot, select “add
                    write-in candidate” and then enter the name.
                  </li>
                  <li>
                    If there is a mistake on your printed ballot, ask an
                    election inspector for help.
                  </li>
                </ul>
              </small>
            </Prose>
          </StartInstructions>
        </MainChild>
      </Main>
      <Sidebar
        footer={
          <React.Fragment>
            <SettingsTextSize
              userSettings={userSettings}
              setUserSettings={setUserSettings}
            />
            <ElectionInfo
              election={election}
              ballotStyleId={ballotStyleId}
              precinctId={precinctId}
              horizontal
            />
          </React.Fragment>
        }
      >
        <Prose>
          <SidebarSpacer />
          <Wobble as="p">
            <LinkButton
              big
              primary
              onPress={onStart}
              id="next"
              aria-label="Press the right button to advance to the first contest."
            >
              Start Voting
            </LinkButton>
          </Wobble>
        </Prose>
      </Sidebar>
    </Screen>
  )
}

export default withRouter(StartPage)
