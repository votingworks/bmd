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

enum PrintingState {
  StartPrinting = 1,
  PrintBallot,
  PrintTracker,
  DonePrinting,
  CardEmpty,
  CardAbsent,
  ErrorTracker,
  ErrorCard,
}

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

  const [printingState, setPrintingState] = useState<PrintingState>(
    PrintingState.CardAbsent
  )
  const [trackerString, setTrackerString] = useState('')
  const [cardMarkedUsed, setCardMarkedUsed] = useState(false)
  const [ballotId, setBallotId] = useState('')

  const markCardUsed = async () => {
    const isUsed = await markVoterCardPrinted()
    setCardMarkedUsed(isUsed)
    if (!isUsed) {
      setPrintingState(PrintingState.ErrorCard)
    }
  }

  const printBallot = async () => {
    await printer.print()
    updateTally()
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

    if (ballotTrackingCode) {
      setTrackerString(ballotTrackingCode)
    } else {
      setPrintingState(PrintingState.ErrorTracker)
    }
  }

  const printTrackingCode = async () => {
    await printer.print()
  }

  // the most important thing to know about this state machine is that
  // it triggers when any of printingState, trackerString, or cardMarkedUsed is updated.
  useEffect(() => {
    ;(async () => {
      switch (printingState) {
        case PrintingState.StartPrinting:
          if (cardMarkedUsed) {
            setCardMarkedUsed(false)
            break
          }

          if (useElectionGuard && trackerString) {
            setTrackerString('')
            break
          }

          setPrintingState(PrintingState.PrintBallot)

          if (useElectionGuard) {
            // don't await, just kick off both jobs
            generateTrackingCode()
            markCardUsed()
          }

          break
        case PrintingState.PrintBallot:
          if (!cardMarkedUsed) {
            break
          }

          if (useElectionGuard && !trackerString) {
            break
          }

          // the card is now marked used and we have a tracker
          await printBallot()
          setPrintingState(
            useElectionGuard
              ? PrintingState.PrintTracker
              : PrintingState.DonePrinting
          )
          break
        case PrintingState.PrintTracker:
          await printTrackingCode()
          printBallotTrackingCodeTimer.current = window.setTimeout(() => {
            setPrintingState(PrintingState.DonePrinting)
          }, printingMessageTimeoutSeconds * 1000)
          break
        case PrintingState.DonePrinting:
        case PrintingState.ErrorTracker:
        case PrintingState.ErrorCard:
          if (trackerString) {
            setTrackerString('')
          }
          if (cardMarkedUsed) {
            setCardMarkedUsed(false)
          }
          break
      }
    })()
  }, [printingState, trackerString, cardMarkedUsed])

  useEffect(() => {
    if (isVoterCardPresent) {
      if (isEmptyObject(votes)) {
        setPrintingState(PrintingState.CardEmpty)
      } else {
        setBallotId(randomBase64())
        setPrintingState(PrintingState.StartPrinting)
      }
    } else {
      setPrintingState(PrintingState.CardAbsent)
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
    if (printingState === PrintingState.CardEmpty) {
      return (
        <React.Fragment>
          <h1>Empty Card</h1>
          <p>This card does not contain any votes.</p>
        </React.Fragment>
      )
    } else if (printingState === PrintingState.DonePrinting) {
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
    } else if (printingState === PrintingState.PrintBallot) {
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
    } else if (printingState === PrintingState.PrintTracker) {
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
    } else if (printingState === PrintingState.CardAbsent) {
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
    } else if (printingState === PrintingState.ErrorTracker) {
      return (
        <React.Fragment>
          <h1>An Error Occurred</h1>
          <p>No ballot tracking code was generated.</p>
        </React.Fragment>
      )
    } else if (printingState === PrintingState.ErrorCard) {
      return (
        <React.Fragment>
          <h1>An Error Occurred</h1>
          <p>The card could not be erased. Please try again.</p>
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
      {printingState === PrintingState.PrintBallot && (
        <PrintedBallot
          ballotId={ballotId}
          ballotStyleId={ballotStyleId}
          election={election}
          isLiveMode={isLiveMode}
          precinctId={precinctId}
          votes={votes}
        />
      )}
      {printingState === PrintingState.PrintTracker && (
        <ElectionGuardBallotTrackingCode
          election={election}
          tracker={trackerString}
        />
      )}
    </React.Fragment>
  )
}

export default PrintOnlyScreen
