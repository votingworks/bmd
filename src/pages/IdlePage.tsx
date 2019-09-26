import React, {
  useContext,
  useEffect,
  useState,
  PointerEventHandler,
} from 'react'
import pluralize from 'pluralize'

import useInterval from 'use-interval'

import BallotContext from '../contexts/ballotContext'

import Button from '../components/Button'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Loading from '../components/Loading'
import { IDLE_RESET_TIMEOUT_SECONDS } from '../config/globals'

const timeoutSeconds = IDLE_RESET_TIMEOUT_SECONDS

const IdlePage = () => {
  const { election, markVoterCardVoided, resetBallot } = useContext(
    BallotContext
  )
  const [countdown, setCountdown] = useState(timeoutSeconds)
  const [isLoading, setIsLoading] = useState(false)
  const { title } = election

  const onPress: PointerEventHandler = () => {}

  useEffect(() => {
    const reset = async () => {
      setIsLoading(true)
      await markVoterCardVoided()
      resetBallot()
    }
    countdown === 0 && reset()
  }, [countdown, markVoterCardVoided, resetBallot])

  useInterval(() => {
    setCountdown(countdown => countdown - 1)
  }, 1000)

  return (
    <Main>
      <MainChild center>
        {isLoading ? (
          <Loading>Clearing ballot</Loading>
        ) : (
          <Prose textCenter>
            <h1 aria-label={`${title}.`}>{title}</h1>
            <hr />
            <p>
              This voting station has been inactive for more than one minute.
            </p>
            <p>
              To protect your privacy, this ballot will be cleared in{' '}
              <strong>{pluralize('second', countdown, true)}</strong>.
            </p>
            <Button primary onPress={onPress}>
              Touch the screen to go back to the ballot.
            </Button>
          </Prose>
        )}
      </MainChild>
    </Main>
  )
}

export default IdlePage
