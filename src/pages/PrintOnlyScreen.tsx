import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { VotesDict, Election, BallotType } from '@votingworks/ballot-encoder'

import Loading from '../components/Loading'
import ElectionGuardBallotTrackingCode from '../components/ElectionGuardBallotTrackingCode'
import Main, { MainChild } from '../components/Main'
import PrintedBallot from '../components/PrintedBallot'
import Prose from '../components/Prose'
import Screen from '../components/Screen'
import { DEFAULT_FONT_SIZE, LARGE_DISPLAY_FONT_SIZE } from '../config/globals'
import { MarkVoterCardFunction, PartialUserSettings } from '../config/types'
import { Printer } from '../utils/printer'
import isEmptyObject from '../utils/isEmptyObject'
import { randomBase64 } from '../utils/random'
import { getBallotStyle, getPrecinctById } from '../utils/election'

import encryptBallotWithElectionGuard from '../endToEnd'

const Graphic = styled.img`
  margin: 0 auto -1rem;
  height: 40vw;
`

interface Props {
  ballotStyleId: string
  election: Election
  isLiveMode: boolean
  isVoterCardPresent: boolean
  markVoterCardPrinted: MarkVoterCardFunction
  precinctId: string
  printer: Printer
  setUserSettings: (partial: PartialUserSettings) => void
  updateTally: () => void
  votes: VotesDict
}

export const printingMessageTimeoutSeconds = 4

const PrintOnlyScreen = ({
  ballotStyleId,
  election,
  isLiveMode,
  isVoterCardPresent,
  markVoterCardPrinted,
  precinctId,
  printer,
  setUserSettings,
  updateTally,
  votes,
}: Props) => {
  // TODO: move to election definition before merging to master
  const useElectionGuard = true
  const printBallotTimer = useRef(0)
  const printBallotTrackingCodeTimer = useRef(0)

  const [printingState, setPrintingState] = useState('')

  const [trackerString, setTrackerString] = useState('')
  const [ballotId, setBallotId] = useState('')

  const markCardUsedAndPrintBallotAndTally = async () => {
    const isUsed = await markVoterCardPrinted()
    // TODO: handle card write failure
    /* istanbul ignore else */
    if (isUsed) {
      await printer.print()
      updateTally()
    }
    return
  }

  const printBallot = async () => {
    await markCardUsedAndPrintBallotAndTally()
  }

  const generateTrackingCode = async () => {
    const ballotTrackingCode = await encryptBallotWithElectionGuard({
      election,
      ballotStyle: getBallotStyle({ ballotStyleId, election }),
      precinct: getPrecinctById({ precinctId, election })!,
      ballotId,
      votes,
      isTestBallot: !isLiveMode,
      ballotType: BallotType.Standard,
    })

    // TODO: handle failure to get ballot tracking code
    setTrackerString(ballotTrackingCode)
  }

  const printTrackingCode = async () => {
    await printer.print()
  }

  useEffect(() => {
    ;(async () => {
      switch (printingState) {
        case 'PRINT_BALLOT':
          await printBallot()
          if (useElectionGuard) {
            // no delay in next state because that state takes a while
            setPrintingState('GENERATE_TRACKER')
          } else {
            printBallotTimer.current = window.setTimeout(() => {
              setPrintingState('PRINT_DONE')
            }, printingMessageTimeoutSeconds * 1000)
          }
          break
        case 'GENERATE_TRACKER':
          await generateTrackingCode()
          setPrintingState('PRINT_TRACKER')
          break
        case 'PRINT_TRACKER':
          await printTrackingCode()
          printBallotTrackingCodeTimer.current = window.setTimeout(() => {
            setPrintingState('PRINT_DONE')
          }, printingMessageTimeoutSeconds * 1000)
          break
        case 'PRINT_DONE':
          break
      }
    })()
  }, [printingState, useElectionGuard])

  useEffect(() => {
    if (isVoterCardPresent) {
      if (isEmptyObject(votes)) {
        setPrintingState('NO_VOTES')
      } else {
        setBallotId(randomBase64())
        setPrintingState('PRINT_BALLOT')
      }
    } else {
      setPrintingState('NO_CARD')
    }
  }, [isVoterCardPresent, votes])

  useEffect(() => {
    setUserSettings({ textSize: LARGE_DISPLAY_FONT_SIZE })
    return () => {
      setUserSettings({ textSize: DEFAULT_FONT_SIZE })
      clearTimeout(printBallotTimer.current)
      clearTimeout(printBallotTrackingCodeTimer.current)
    }
  }, [setUserSettings])

  const renderContent = () => {
    if (printingState === 'NO_VOTES') {
      return (
        <React.Fragment>
          <h1>Empty Card</h1>
          <p>This card does not contain any votes.</p>
        </React.Fragment>
      )
    } else if (printingState === 'PRINT_DONE') {
      return (
        <React.Fragment>
          <p>
            <Graphic
              src="/images/verify-and-cast.svg"
              alt="Verify and Cast"
              aria-hidden
            />
          </p>
          <h1>Verify and Cast Your Printed Ballot</h1>
          <p>
            Verify your votes on printed ballot are correct. <br />
            Cast your official ballot in the ballot box.
          </p>
        </React.Fragment>
      )
    } else if (
      printingState === 'PRINT_BALLOT' ||
      printingState === 'GENERATE_TRACKER'
    ) {
      return (
        <React.Fragment>
          <p>
            <Graphic
              src="/images/printing-ballot.svg"
              alt="Printing Ballot"
              aria-hidden
            />
          </p>
          <h1>
            <Loading>Printing your official ballot</Loading>
          </h1>
        </React.Fragment>
      )
    } else if (printingState === 'PRINT_TRACKER') {
      return (
        <React.Fragment>
          <p>
            <Graphic
              src="/images/printing-ballot.svg"
              alt="Printing Tracking Code"
              aria-hidden
            />
          </p>
          <h1>
            <Loading>Printing your ballot tracking code</Loading>
          </h1>
        </React.Fragment>
      )
    } else if (printingState === 'NO_CARD') {
      return (
        <React.Fragment>
          <p>
            <Graphic
              src="/images/insert-card.svg"
              alt="Insert Card"
              aria-hidden
            />
          </p>
          <h1>Insert Card</h1>
          <p>Insert Card to print your official ballot.</p>
        </React.Fragment>
      )
    }
  }

  return (
    <React.Fragment>
      <Screen white>
        <Main>
          <MainChild centerVertical maxWidth={false}>
            <Prose textCenter>{renderContent()}</Prose>
          </MainChild>
        </Main>
      </Screen>
      {printingState === 'PRINT_BALLOT' && (
        <PrintedBallot
          ballotId={ballotId}
          ballotStyleId={ballotStyleId}
          election={election}
          isLiveMode={isLiveMode}
          precinctId={precinctId}
          votes={votes}
        />
      )}
      {printingState === 'PRINT_TRACKER' && (
        <ElectionGuardBallotTrackingCode
          election={election}
          tracker={trackerString}
        />
      )}
    </React.Fragment>
  )
}

export default PrintOnlyScreen
