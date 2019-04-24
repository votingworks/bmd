import React from 'react'
import { Route } from 'react-router-dom'

import { render } from '../../test/testUtils'

import PrintPage from './PrintPage'

it(`if no contests, redirect to / and reset ballot`, () => {
  const resetBallot = jest.fn()
  const homeMock = () => <div>Home Mock</div>
  const { getByText } = render(
    <>
      <Route path="/print" component={PrintPage} />
      <Route exact path="/" render={homeMock} />
    </>,
    {
      contests: [],
      resetBallot,
      route: '/print',
    }
  )

  expect(resetBallot).toBeCalled()
  expect(getByText('Home Mock')).toBeTruthy()
})
