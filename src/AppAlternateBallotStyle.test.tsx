import React from 'react'
import { fireEvent, render } from 'react-testing-library'

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

it(`Displays alternate ballot`, async () => {
  window.localStorage.setItem(electionKey, electionSampleAsString)
  const { getByText, getByTestId } = render(<App />)

  getByText('Scan Your Activation Code')

  fireEvent.change(getByTestId('activation-code'), {
    // Enter activation code with different ballot style.
    target: { value: 'VX.precinct-21.5R' },
  })

  // TODO: replace next line with "Enter" keyDown on activation code input
  fireEvent.click(getByText('Submit'))

  // Get Started Page
  fireEvent.click(getByText('Get Started'))

  // Number of questions maps to expected length
  getByText('1 of 11')
})
