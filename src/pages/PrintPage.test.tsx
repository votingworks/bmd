import React from 'react'
import { Route } from 'react-router-dom'

import { render } from '../../test/testUtils'

import PrintPage from './PrintPage'

it(`if no contests, redirect to /reset`, () => {
  const resetMock = () => <div>Reset Mock</div>
  const { getByText } = render(
    <>
      <Route path="/print" component={PrintPage} />
      <Route exact path="/reset" render={resetMock} />
    </>,
    {
      contests: [],
      route: '/print',
    }
  )

  expect(getByText('Reset Mock')).toBeTruthy()
})
