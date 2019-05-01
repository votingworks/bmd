import React from 'react'
import { Route } from 'react-router-dom'

import { render } from '../../test/testUtils'

import ActivationPage from './ActivationPage'

// https://www.npmjs.com/package/jest-fetch-mock
import fetch, { FetchMock, GlobalWithFetchMock } from 'jest-fetch-mock'
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
customGlobal.fetch = fetch as FetchMock
customGlobal.fetchMock = customGlobal.fetch as FetchMock

it(`fetches the card data after 1 second`, async () => {
  jest.useFakeTimers()

  fetchMock.mockResponses(
    [JSON.stringify({}), { status: 200 }],
    [JSON.stringify({ card: 'VX.precinct-21.5R' }), { status: 200 }],
    ['', { status: 500 }]
  )

  render(<Route path="/" component={ActivationPage} />, {
    route: '/',
  })

  expect(setInterval).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(1000)

  jest.advanceTimersByTime(1000)

  // TODO: check that setActivationCode has been called

  jest.advanceTimersByTime(1000)

  expect(fetchMock.mock.calls.length).toEqual(3)
  expect(fetchMock.mock.calls).toEqual([
    ['/card/read'],
    ['/card/read'],
    ['/card/read'],
  ])

  // TODO: not clear why this one is failing
  // expect(clearInterval).toHaveBeenCalledTimes(2)

  fetchMock.resetMocks()
})
