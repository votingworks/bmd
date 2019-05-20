import React from 'react'
import { fireEvent, render } from 'react-testing-library'
import fetchMock from 'fetch-mock'

import waitForExpect from 'wait-for-expect'
import electionSample from './data/electionSample.json'

import App, { electionKey, mergeWithDefaults } from './App'

import { Election } from './config/types'

const electionSampleAsString = JSON.stringify(
  mergeWithDefaults(electionSample as Election)
)

beforeEach(() => {
  window.localStorage.clear()
  window.location.href = '/'
})

async function sleep(milliseconds: number) {
  return new Promise(resolve => {
    window.setTimeout(resolve, milliseconds)
  })
}

const cardValueAbsent = {
  present: false,
  shortValue: '',
}

it(`basic end-to-end flow with voter ballot tracker`, async () => {
  let cardFunctionsAsExpected = true
  let currentCardValue = cardValueAbsent

  fetchMock.get('/card/read', () => {
    return JSON.stringify(currentCardValue)
  })

  fetchMock.get('/card/read_long', () => {
    return JSON.stringify({ longValue: electionSampleAsString })
  })

  fetchMock.post('/card/write', (url, options) => {
    if (cardFunctionsAsExpected) {
      currentCardValue = { present: true, shortValue: options.body as string }
    }
    return ''
  })

  const eventListenerCallbacksDictionary: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  window.addEventListener = jest.fn((event, cb) => {
    eventListenerCallbacksDictionary[event] = cb
  })
  window.print = jest.fn(() => {
    eventListenerCallbacksDictionary.afterprint()
  })

  window.localStorage.setItem(electionKey, electionSampleAsString)
  const { getByText, getByTestId, queryByText } = render(<App />)
  fireEvent.change(getByTestId('activation-code'), {
    target: {
      value: 'VX.23.12',
    },
  })

  // TODO: replace next line with "Enter" keyDown on activation code input
  fireEvent.click(getByText('Submit'))

  // Go to First Contest
  fireEvent.click(getByText('Get Started'))

  // Past first interstitial
  fireEvent.click(getByText('Start Voting'))

  // Go to Pre Review Screen
  while (!queryByText('Review Your Selections')) {
    fireEvent.click(getByText('Next'))
  }

  // Go to Review Screen
  fireEvent.click(getByText('Review Selections'))
  getByText('Review Your Ballot Selections')

  // Print Screen
  fireEvent.click(getByText('Next'))
  getByText('Print your official ballot')

  // Test Print Ballot Modal
  fireEvent.click(getByText('Print Ballot'))
  fireEvent.click(getByText('Yes, print my ballot.'))

  await waitForExpect(() => {
    expect(window.print).toBeCalled()
  })

  await sleep(300)

  // Review and Cast Instructions
  getByText('Now printing your tracker...')

  // expect two print jobs
  expect(window.print).toHaveBeenCalledTimes(2)

  await sleep(100)

  getByText('Cast your printed ballot')
})
