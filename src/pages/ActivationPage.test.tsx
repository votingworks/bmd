import React from 'react'
import { Route } from 'react-router-dom'

import { render } from '../../test/testUtils'
import electionSampleDemo from '../data/electionSampleDemo.json'
import electionSample from '../data/electionSample.json'

import ActivationPage from './ActivationPage'

it(`renders ActivationPage`, () => {
  const activateBallotMock = jest.fn()
  render(<Route path="/activate" component={ActivationPage} />, {
    election: electionSampleDemo,
    route: '/activate',
    activateBallot: activateBallotMock,
  })

  expect(activateBallotMock).toBeCalled()
})

it(`renders ActivationPage`, () => {
  const activateBallotMock = jest.fn()
  render(<Route path="/activate" component={ActivationPage} />, {
    election: electionSample,
    route: '/activate',
    activateBallot: activateBallotMock,
  })

  expect(activateBallotMock).not.toBeCalled()
})
