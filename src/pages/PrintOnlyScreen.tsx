import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useMachine } from '@xstate/react'
import { Machine } from 'xstate'

import { VotesDict, Election } from '@votingworks/ballot-encoder'

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

const printStateMachine = Machine({
  id: 'ballotPrinter',
  initial: 'noCard',
  states: {
    noCard: {
      on: {
        PRINT_BALLOT: 'printingBallot',
        NO_VOTES: 'noVotesOnCard',
      },
    },
    noVotesOnCard: {
      on: {
        REMOVE_CARD: 'noCard',
      },
    },
    printingBallot: {
      on: {
        REMOVE_CARD: 'noCard',
        PRINT_TRACKING_CODE: 'printingBallotTrackingCode',
        PRINTING_COMPLETE: 'printingComplete',
      },
    },
    printingBallotTrackingCode: {
      on: {
        REMOVE_CARD: 'noCard',
        PRINTING_COMPLETE: 'printingComplete',
      },
    },
    printingComplete: {
      on: {
        REMOVE_CARD: 'noCard',
      },
    },
  },
})

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

  const [stateMachine, sendStateMachineEvent] = useMachine(printStateMachine)

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
    printBallotTimer.current = window.setTimeout(() => {
      sendStateMachineEvent('PRINTING_COMPLETE')
    }, printingMessageTimeoutSeconds * 1000)
  }

  const printBallotAndTrackingCode = async () => {
    const ballotTrackingCode = await encryptBallotWithElectionGuard(votes)
    // TODO: handle failure to get ballot tracking code
    setTrackerString(ballotTrackingCode)
    await markCardUsedAndPrintBallotAndTally()
    printBallotTimer.current = window.setTimeout(async () => {
      sendStateMachineEvent('PRINT_TRACKING_CODE')
      await printer.print()
      printBallotTrackingCodeTimer.current = window.setTimeout(() => {
        sendStateMachineEvent('PRINTING_COMPLETE')
      }, printingMessageTimeoutSeconds * 1000)
    }, printingMessageTimeoutSeconds * 1000)
  }

  useEffect(() => {
    if (isVoterCardPresent) {
      if (isEmptyObject(votes)) {
        sendStateMachineEvent('NO_VOTES')
      } else {
        sendStateMachineEvent('PRINT_BALLOT')
        setBallotId(randomBase64())
        if (useElectionGuard) {
          printBallotAndTrackingCode()
        } else {
          printBallot()
        }
      }
    } else {
      sendStateMachineEvent('REMOVE_CARD')
    }
  }, [isVoterCardPresent])

  useEffect(() => {
    setUserSettings({ textSize: LARGE_DISPLAY_FONT_SIZE })
    return () => {
      setUserSettings({ textSize: DEFAULT_FONT_SIZE })
      clearTimeout(printBallotTimer.current)
      clearTimeout(printBallotTrackingCodeTimer.current)
    }
  }, [setUserSettings])

  const renderContent = () => {
    if (stateMachine.value === 'noVotesOnCard') {
      return (
        <React.Fragment>
          <h1>Empty Card</h1>
          <p>This card does not contain any votes.</p>
        </React.Fragment>
      )
    } else if (stateMachine.value === 'printingComplete') {
      return (
        <React.Fragment>
          <p>
            <Graphic
              src="/images/verify-and-cast.svg"
              alt="Printing Ballot"
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
    } else if (stateMachine.value === 'printingBallot') {
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
    } else if (stateMachine.value === 'printingBallotTrackingCode') {
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
            <Loading>Printing your ballot tracking code</Loading>
          </h1>
        </React.Fragment>
      )
    } else if (stateMachine.value === 'noCard') {
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
      {stateMachine.value === 'printingBallot' && (
        <PrintedBallot
          ballotId={ballotId}
          ballotStyleId={ballotStyleId}
          election={election}
          isLiveMode={isLiveMode}
          precinctId={precinctId}
          votes={votes}
        />
      )}
      {stateMachine.value === 'printingBallotTrackingCode' && (
        <ElectionGuardBallotTrackingCode
          election={election}
          tracker={trackerString}
        />
      )}
    </React.Fragment>
  )
}

export default PrintOnlyScreen
