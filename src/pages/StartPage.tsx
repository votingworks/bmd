import React, { useContext } from 'react'
import styled from 'styled-components'

import BallotContext from '../contexts/ballotContext'

import LinkButton from '../components/LinkButton'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'

const Seal = styled.div`
  max-width: 320px;
  margin: 0 auto 1rem;
`

const StartPage = () => {
  const { election } = useContext(BallotContext)
  const { title, state, county, date, seal } = election!

  return (
    <Main>
      <MainChild center>
        <Seal dangerouslySetInnerHTML={{ __html: seal }} />
        <Prose textCenter>
          <h1 aria-label={`${title}.`}>{title}</h1>
          <p aria-label={`${date}. ${county}, ${state}.`}>
            {date}
            <br />
            {county}, {state}
          </p>
          <p>
            <LinkButton primary to={`/contests/`}>
              Get Started
            </LinkButton>
          </p>
        </Prose>
      </MainChild>
    </Main>
  )
}

export default StartPage
