import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import fetchMock from 'fetch-mock'

import App from './App'

import { noCard, voterCard, advanceTimers } from '../test/helpers/smartcards'

import {
  presidentContest,
  setElectionInLocalStorage,
  setStateInLocalStorage,
} from '../test/helpers/election'

let currentCard = noCard
fetchMock.get('/card/read', () => JSON.stringify(currentCard))

jest.useFakeTimers()

beforeEach(() => {
  window.localStorage.clear()
  window.location.href = '/'
})

it(`Refresh window and expect to be on same contest`, async () => {
  // ====================== BEGIN CONTEST SETUP ====================== //

  setElectionInLocalStorage()
  setStateInLocalStorage()

  let app = render(<App />)
  let { getByText } = app
  const { unmount } = app

  // Insert Voter Card
  currentCard = voterCard
  advanceTimers()

  // Go to Voting Instructions
  await wait(() => fireEvent.click(getByText('Get Started')))
  advanceTimers()

  // Go to First Contest
  fireEvent.click(getByText('Start Voting'))
  advanceTimers()

  // ====================== END CONTEST SETUP ====================== //

  const candidate0 = presidentContest.candidates[0].name

  getByText(presidentContest.title)

  // Select first candiate
  fireEvent.click(getByText(candidate0))
  advanceTimers()

  unmount()

  app = render(<App />)
  ;({ getByText } = app)

  advanceTimers()

  // Select second candidate
  await wait(() => fireEvent.click(getByText(candidate0)))
})
