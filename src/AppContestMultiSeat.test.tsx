import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import fetchMock from 'fetch-mock'

import App from './App'

import { noCard, voterCard, advanceTimers } from '../test/helpers/smartcards'

import {
  countyCommissionersContest,
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

it(`Single Seat Contest`, async () => {
  // ====================== BEGIN CONTEST SETUP ====================== //

  setElectionInLocalStorage()
  setStateInLocalStorage()

  const { container, getByText, queryByText } = render(<App />)

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

  const candidate0 = countyCommissionersContest.candidates[0]
  const candidate1 = countyCommissionersContest.candidates[1]
  const candidate2 = countyCommissionersContest.candidates[2]
  const candidate3 = countyCommissionersContest.candidates[3]
  const candidate4 = countyCommissionersContest.candidates[4]

  // Advance to multi-seat contest
  while (!queryByText(countyCommissionersContest.title)) {
    fireEvent.click(getByText('Next'))
    advanceTimers()
  }

  // Select 5 candidates for 4 seats
  fireEvent.click(getByText(candidate0.name))
  fireEvent.click(getByText(candidate1.name))
  fireEvent.click(getByText(candidate2.name))
  fireEvent.click(getByText(candidate3.name))
  fireEvent.click(getByText(candidate4.name))

  // Overvote modal is displayed
  getByText(
    `You may only select ${countyCommissionersContest.seats} candidates in this contest. To vote for ${candidate4.name}, you must first unselect selected candidates.`
  )

  // Capture styles of Single Candidate Contest
  expect(container.firstChild).toMatchSnapshot()

  // Go to Review Screen
  while (!queryByText('Review Your Selections')) {
    fireEvent.click(getByText('Next'))
    advanceTimers()
  }
  fireEvent.click(getByText('Review Selections'))
  advanceTimers()

  // Expect to see the first four selected candidates
  expect(getByText(candidate0.name)).toBeTruthy()
  expect(getByText(candidate1.name)).toBeTruthy()
  expect(getByText(candidate2.name)).toBeTruthy()
  expect(getByText(candidate3.name)).toBeTruthy()
})
