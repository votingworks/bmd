import React, { useContext } from 'react'

import BallotContext from '../contexts/ballotContext'

import LinkButton from '../components/LinkButton'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Seal from '../components/Seal'

const StartPage = () => {
  const { ballotStyleId, election, precinctId } = useContext(BallotContext)
  const { title, state, county, date, seal, sealURL } = election!

  return (
    <Main>
      <MainChild center>
        <Seal seal={seal} sealURL={sealURL} />
        <Prose textCenter>
          <h1 aria-label={`${title}.`}>{title}</h1>
          <p aria-hidden="true">
            {date}
            <br />
            {county.name}, {state}
          </p>
          <hr />
          <h2>
            Precinct: {precinctId}
            <br />
            Ballot Style: {ballotStyleId}
          </h2>
          <p>
            <br />
            <LinkButton
              primary
              to="/instructions/"
              id="next"
              aria-label="Select Next to Get Started."
            >
              Get Started
            </LinkButton>
          </p>
        </Prose>
      </MainChild>
    </Main>
  )
}

export default StartPage
