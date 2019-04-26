import React from 'react'
import { Route } from 'react-router-dom'

import { render } from '../../test/testUtils'

import ResetPage from './ResetPage'

it(`calls ballot reset`, () => {
  const resetBallot = jest.fn()
  render(
    <>
      <Route path="/reset" component={ResetPage} />
    </>,
    {
      resetBallot,
      route: '/reset',
    }
  )

  expect(resetBallot).toBeCalled()
})
