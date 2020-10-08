import React, { useState } from 'react'
import { OptionalElection } from '@votingworks/ballot-encoder'

import {
  AppMode,
  SelectChangeEventFunction,
  VoidFunction,
} from '../config/types'

import TestBallotDeckScreen from './TestBallotDeckScreen'

import Button, { SegmentedButton } from '../components/Button'
import Main, { MainChild } from '../components/Main'
import Prose from '../components/Prose'
import Text from '../components/Text'
import Sidebar from '../components/Sidebar'
import ElectionInfo from '../components/ElectionInfo'
import Screen from '../components/Screen'
import Select from '../components/Select'
import {
  AMERICA_TIMEZONES,
  MONTHS_SHORT,
  twelveHourTime,
  shortWeekdayAndDate,
  getDaysInMonth,
} from '../utils/date'
import InputGroup from '../components/InputGroup'
import Modal from '../components/Modal'

type Meridian = 'AM' | 'PM'

interface Props {
  appMode: AppMode
  appPrecinctId: string
  ballotsPrintedCount: number
  election: OptionalElection
  isLiveMode: boolean
  fetchElection: VoidFunction
  isFetchingElection: boolean
  setAppPrecinctId: (appPrecinctId: string) => void
  toggleLiveMode: VoidFunction
  unconfigure: VoidFunction
}

const getMachineTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone
const getTimezoneByIANAZone = (IANAZone: string) =>
  AMERICA_TIMEZONES.find((tz) => tz.IANAZone === IANAZone)

const ClerkScreen = ({
  appMode,
  appPrecinctId,
  ballotsPrintedCount,
  election,
  isLiveMode,
  fetchElection,
  isFetchingElection,
  setAppPrecinctId,
  toggleLiveMode,
  unconfigure,
}: Props) => {
  const changeAppPrecinctId: SelectChangeEventFunction = (event) => {
    setAppPrecinctId(event.currentTarget.value)
  }

  const [isTestDeck, setIsTestDeck] = useState(false)
  const showTestDeck = () => setIsTestDeck(true)
  const hideTestDeck = () => setIsTestDeck(false)

  const [isSavingDate, setIsSavingDate] = useState(false)
  const [isSystemDateModalActive, setIsSystemDateModalActive] = useState(false)
  const [systemDate, setSystemDate] = useState(new Date())
  const [systemMeridian, setSystemMeridan] = useState<Meridian>(
    systemDate.getHours() < 12 ? 'AM' : 'PM'
  )
  const [timezone, setTimezone] = useState(
    getTimezoneByIANAZone(getMachineTimezone())
  )
  const cancelSystemDateEdit = () => {
    setSystemDate(new Date())
    setTimezone(getTimezoneByIANAZone(getMachineTimezone()))
    setIsSystemDateModalActive(false)
  }
  const updateSystemTime: SelectChangeEventFunction = (event) => {
    const {
      value,
      dataset: { label },
    } = event.currentTarget
    let hour = systemDate.getHours()
    if (label === 'hour') {
      if (systemMeridian === 'AM') {
        hour = parseInt(value, 10) % 12
      } else {
        hour = (parseInt(value, 10) % 12) + 12
      }
    }
    if (label === 'meridian') {
      setSystemMeridan(value as Meridian)
      if (value === 'AM' && systemDate.getHours() >= 12) {
        hour = systemDate.getHours() - 12
      }
      if (value === 'PM' && systemDate.getHours() < 12) {
        hour = systemDate.getHours() + 12
      }
    }
    setSystemDate(
      new Date(
        label === 'year' ? parseInt(value, 10) : systemDate.getFullYear(),
        label === 'month' ? parseInt(value, 10) : systemDate.getMonth(),
        label === 'day' ? parseInt(value, 10) : systemDate.getDate(),
        hour,
        label === 'minute' ? parseInt(value, 10) : systemDate.getMinutes()
      )
    )
  }
  const updateTimeZone: SelectChangeEventFunction = (event) => {
    setTimezone(getTimezoneByIANAZone(event.currentTarget.value))
  }
  const saveDateAndZone = async () => {
    if (timezone) {
      try {
        setIsSavingDate(true)
        await window.kiosk?.setClock({
          isoDatetime: systemDate.toISOString(),
          IANAZone: timezone.IANAZone,
        })
        setIsSavingDate(false)
        setIsSystemDateModalActive(false)
      } catch (error) {
        setIsSavingDate(false)
      }
    }
  }

  if (isTestDeck && election) {
    return (
      <TestBallotDeckScreen
        appName={appMode.name}
        appPrecinctId={appPrecinctId}
        election={election}
        hideTestDeck={hideTestDeck}
        isLiveMode={false} // always false for Test Mode
      />
    )
  }

  const isTestDecksAvailable = !isLiveMode && appMode.isVxPrint
  return (
    <Screen flexDirection="row-reverse" voterMode={false}>
      <Main padded>
        <MainChild maxWidth={false}>
          <Prose>
            {election && (
              <React.Fragment>
                <h1>
                  <label htmlFor="selectPrecinct">Precinct</label>
                </h1>
                <p>
                  <Select
                    id="selectPrecinct"
                    value={appPrecinctId}
                    onBlur={changeAppPrecinctId}
                    onChange={changeAppPrecinctId}
                  >
                    <option value="" disabled>
                      Select a precinct for this device…
                    </option>
                    {election.precincts
                      .sort((a, b) =>
                        a.name.localeCompare(b.name, undefined, {
                          ignorePunctuation: true,
                        })
                      )
                      .map((precinct) => (
                        <option key={precinct.id} value={precinct.id}>
                          {precinct.name}
                        </option>
                      ))}
                  </Select>
                </p>
                <h1>Testing Mode</h1>
                <p>
                  <SegmentedButton>
                    <Button
                      onPress={toggleLiveMode}
                      primary={!isLiveMode}
                      disabled={!isLiveMode}
                    >
                      Testing Mode
                    </Button>
                    <Button
                      onPress={toggleLiveMode}
                      primary={isLiveMode}
                      disabled={isLiveMode}
                    >
                      Live Election Mode
                    </Button>
                  </SegmentedButton>
                </p>
                {appMode.isVxPrint && (
                  <React.Fragment>
                    <p>
                      <Button
                        small
                        disabled={!isTestDecksAvailable}
                        onPress={showTestDeck}
                      >
                        View Test Ballot Decks
                      </Button>{' '}
                      {isLiveMode && (
                        <Text as="small" muted>
                          (Available in testing mode)
                        </Text>
                      )}
                    </p>
                    <Text as="h1">Stats</Text>
                    <Text>
                      Printed and Tallied Ballots:{' '}
                      <strong>{ballotsPrintedCount}</strong>{' '}
                    </Text>
                  </React.Fragment>
                )}
                <h1>Current Time, Date, and Timezone</h1>
                <p>
                  Time: <strong>{twelveHourTime(systemDate.toString())}</strong>
                  <br />
                  Date:{' '}
                  <strong>{shortWeekdayAndDate(systemDate.toString())}</strong>
                  <br />
                  Timezone: <strong>{timezone?.label || 'unknown'}</strong>
                </p>
                <p>
                  <Button onPress={() => setIsSystemDateModalActive(true)}>
                    Update Time, Date, and Timezone
                  </Button>
                </p>
              </React.Fragment>
            )}
            <h1>Configuration</h1>
            {isFetchingElection ? (
              <p>Loading Election Definition from Clerk Card…</p>
            ) : election ? (
              <p>
                <Text as="span" voteIcon>
                  Election definition is loaded.
                </Text>{' '}
                <Button small onPress={unconfigure}>
                  Remove
                </Button>
              </p>
            ) : (
              <React.Fragment>
                <Text warningIcon>Election definition is not Loaded.</Text>
                <p>
                  <Button onPress={fetchElection}>
                    Load Election Definition
                  </Button>
                </p>
              </React.Fragment>
            )}
          </Prose>
        </MainChild>
      </Main>
      <Sidebar
        appName={election ? appMode.name : ''}
        centerContent
        title="Election Admin Actions"
        footer={
          election && (
            <ElectionInfo
              election={election}
              precinctId={appPrecinctId}
              horizontal
            />
          )
        }
      >
        {election && (
          <Prose>
            <h2>Instructions</h2>
            <p>
              Switching Precinct or Live Mode will reset tally and printed
              ballots count.
            </p>
            <p>Remove card when finished.</p>
          </Prose>
        )}
      </Sidebar>
      <Modal
        isOpen={isSystemDateModalActive}
        centerContent
        content={
          <Prose textCenter>
            <h1>
              {shortWeekdayAndDate(systemDate.toString())},{' '}
              {twelveHourTime(systemDate.toString())}
            </h1>
            <div>
              <p>
                <InputGroup as="span">
                  <Select
                    value={systemDate.getFullYear()}
                    data-label="year"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                  >
                    <option value="" disabled>
                      Year
                    </option>
                    {[...Array(11).keys()].map((i) => (
                      <option key={i} value={2020 + i}>
                        {2020 + i}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={systemDate.getMonth()}
                    data-label="month"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                    style={{
                      width: '5rem',
                    }}
                  >
                    <option value="" disabled>
                      Month
                    </option>
                    {MONTHS_SHORT.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={systemDate.getDate()}
                    data-label="day"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                    style={{
                      width: '4.5rem',
                    }}
                  >
                    <option value="" disabled>
                      Day
                    </option>
                    {getDaysInMonth(
                      systemDate.getFullYear(),
                      systemDate.getMonth()
                    ).map((day) => (
                      <option key={day.getDate()} value={day.getDate()}>
                        {day.getDate()}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </p>
              <p>
                <InputGroup as="span">
                  <Select
                    value={systemDate.getHours() % 12 || 12}
                    data-label="hour"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                    style={{
                      width: '4.5rem',
                    }}
                  >
                    <option value="" disabled>
                      Hour
                    </option>
                    {[...Array(12).keys()].map((hour) => (
                      <option key={hour} value={hour + 1}>
                        {hour + 1}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={systemDate.getMinutes()}
                    data-label="minute"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                    style={{
                      width: '4.5rem',
                    }}
                  >
                    <option value="" disabled>
                      Minute
                    </option>
                    {[...Array(60).keys()].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={systemMeridian}
                    data-label="meridian"
                    disabled={isSavingDate}
                    onBlur={updateSystemTime}
                    onChange={updateSystemTime}
                    style={{
                      width: '4.5rem',
                    }}
                  >
                    {['AM', 'PM'].map((meridian) => (
                      <option key={meridian} value={meridian}>
                        {meridian}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </p>
              <p>
                <InputGroup as="span">
                  <Select
                    value={timezone?.IANAZone}
                    disabled={isSavingDate}
                    onBlur={updateTimeZone}
                    onChange={updateTimeZone}
                  >
                    <option value="" disabled>
                      Select timezone…
                    </option>
                    {AMERICA_TIMEZONES.map((tz) => (
                      <option key={tz.label} value={tz.IANAZone}>
                        {tz.label}
                      </option>
                    ))}
                  </Select>
                </InputGroup>
              </p>
            </div>
          </Prose>
        }
        actions={
          <React.Fragment>
            <Button
              disabled={!timezone || isSavingDate}
              primary={!isSavingDate}
              onPress={saveDateAndZone}
            >
              {isSavingDate ? 'Saving…' : 'Save'}
            </Button>
            <Button disabled={isSavingDate} onPress={cancelSystemDateEdit}>
              Cancel
            </Button>
          </React.Fragment>
        }
      />
    </Screen>
  )
}

export default ClerkScreen
