import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

import BallotContext from '../contexts/ballotContext'
import Loading from '../components/Loading'
import Main, { MainChild } from '../components/Main'
import PrintedBallot from '../components/PrintedBallot'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import isEmptyObject from '../utils/isEmptyObject'
import { randomBase64 } from '../utils/random'
import { getBallotStyle, getPrecinctById } from '../utils/election'

import encryptBallot from '../endToEnd'
import ElectionGuardBallotTrackingCode from '../components/ElectionGuardBallotTrackingCode'

export const printerMessageTimeoutSeconds = 5

const Graphic = styled.img`
  margin: 0 auto -1rem;
  height: 30vw;
`

const PrintPage = () => {
  const {
    ballotStyleId,
    election,
    isLiveMode,
    markVoterCardPrinted,
    precinctId,
    printer,
    resetBallot,
    updateTally,
    votes,
  } = useContext(BallotContext)
  const printerTimer = useRef(0)
  const [trackerString, setTrackerString] = useState('')

  // a temporary hack to have a stable ballotId while @beau works
  // on separating the printing into two jobs
  const [ballotId, setBallotId] = useState('')
  if (!ballotId) {
    setBallotId(randomBase64())
  }

  const printBallot = useCallback(async () => {
    const ballotTrackingCode = await encryptBallot({
      election,
      ballotStyle: getBallotStyle({ ballotStyleId, election }),
      precinct: getPrecinctById({ precinctId, election })!,
      ballotId,
      votes,
      isTestBallot: !isLiveMode,
      ballotType: 0,
    })
    setTrackerString(ballotTrackingCode)

    const isUsed = await markVoterCardPrinted()
    /* istanbul ignore else */
    if (isUsed) {
      await printer.print()
      updateTally()
      setBallotId('')
      printerTimer.current = window.setTimeout(() => {
        resetBallot()
      }, printerMessageTimeoutSeconds * 1000)
    }
  }, [
    markVoterCardPrinted,
    printer,
    resetBallot,
    updateTally,
    ballotId,
    ballotStyleId,
    election,
    isLiveMode,
    precinctId,
    votes,
  ])

  useEffect(() => {
    if (!isEmptyObject(votes)) {
      printBallot()
    }
  }, [votes, printBallot])

  useEffect(() => {
    return () => clearTimeout(printerTimer.current)
  }, [])

  return (
    <React.Fragment>
      <Screen>
        <Main>
          <MainChild centerVertical maxWidth={false}>
            <Prose textCenter id="audiofocus">
              <p>
                <Graphic
                  src="/images/printing-ballot.svg"
                  alt="Printing Ballot"
                  aria-hidden
                />
              </p>
              <h1 aria-label="Printing Official Ballot.">
                <Loading>
                  {trackerString
                    ? 'Printing your official ballot and tracking code'
                    : 'Printing your official ballot'}
                </Loading>
              </h1>
            </Prose>
          </MainChild>
        </Main>
      </Screen>
      <PrintedBallot
        ballotId={ballotId}
        ballotStyleId={ballotStyleId}
        election={election!}
        isLiveMode={isLiveMode}
        precinctId={precinctId}
        votes={votes}
      />
      {trackerString && (
        <ElectionGuardBallotTrackingCode
          election={election}
          tracker={trackerString}
        />
      )}
    </React.Fragment>
  )
}

export default PrintPage
