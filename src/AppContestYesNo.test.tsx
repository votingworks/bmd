import React from 'react'
import { fireEvent, render, wait, within } from '@testing-library/react'
import fetchMock from 'fetch-mock'

import App from './App'

import {
  advanceTimers,
  getNewVoterCard,
  noCard,
} from '../test/helpers/smartcards'

import {
  measure102Contest,
  setElectionInLocalStorage,
  setStateInLocalStorage,
} from '../test/helpers/election'

let currentCard = noCard
fetchMock.get('/card/read', () => JSON.stringify(currentCard))
fetchMock.post('/card/write', (url, options) => {
  currentCard = {
    present: true,
    shortValue: options.body as string,
  }
  return ''
})

jest.useFakeTimers()

beforeEach(() => {
  window.localStorage.clear()
  window.location.href = '/'
})

it('Single Seat Contest', async () => {
  // ====================== BEGIN CONTEST SETUP ====================== //

  setElectionInLocalStorage()
  setStateInLocalStorage()

  const { getAllByText, getByText, queryByText, getByTestId } = render(<App />)

  // Insert Voter Card
  currentCard = getNewVoterCard()
  advanceTimers()

  // Go to First Contest
  await wait(() => fireEvent.click(getAllByText('Start Voting')[1]))
  advanceTimers()

  // ====================== END CONTEST SETUP ====================== //

  // Query by text which includes markup.
  // https://stackoverflow.com/questions/55509875/how-to-query-by-text-string-which-contains-html-tags-using-react-testing-library
  const getByTextWithMarkup = (text: string) => {
    getByText((content, node) => {
      const hasText = (node: HTMLElement) => node.textContent === text
      const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child as HTMLElement)
      )
      return hasText(node) && childrenDontHaveText
    })
  }

  // Advance to multi-seat contest
  while (!queryByText(measure102Contest.title)) {
    fireEvent.click(getByText('Next →'))
    advanceTimers()
  }

  // Select Yes
  fireEvent.click(getByText('Yes'))
  expect(getByText('Yes').closest('button')!.dataset.selected).toBe('true')

  // Unselect Yes
  fireEvent.click(getByText('Yes'))
  expect(getByText('Yes').closest('button')!.dataset.selected).toBe('false')

  // Select Yes
  fireEvent.click(getByText('Yes'))
  expect(getByText('Yes').closest('button')!.dataset.selected).toBe('true')

  // Select No
  fireEvent.click(getByText('No'))
  expect(
    within(getByTestId('contest-choices'))
      .getByText('No')
      .closest('button')!.dataset.selected
  ).toBe('false')

  // Overvote modal is displayed
  getByTextWithMarkup(
    'Do you want to change your vote to No? To change your vote, first unselect your vote for Yes.'
  )
  fireEvent.click(getByText('Okay'))
  advanceTimers() // For 200ms Delay in closing modal

  // Go to review page and confirm write in exists
  while (!queryByText('All Your Votes')) {
    fireEvent.click(getByText('Next →'))
    advanceTimers()
  }

  const reviewTitle = getByText(
    `${measure102Contest.section}, ${measure102Contest.title}`
  )
  const siblingTextContent =
    (reviewTitle.nextSibling && reviewTitle.nextSibling.textContent) || ''
  expect(siblingTextContent.trim()).toBe(
    `Yes on ${measure102Contest.shortTitle}`
  )
})
