import React from 'react'
import { render } from 'react-testing-library'

import Modal from './Modal'

it(`displays`, () => {
  jest.useFakeTimers()
  const { container } = render(
    <Modal
      isOpen
      content={<p>Hi</p>}
      actions={
        <>
          <p>there should be a button here</p>
        </>
      }
    />
  )

  // to make sure we hit the timeout
  jest.advanceTimersByTime(20)

  expect(container.firstChild).toMatchSnapshot()
})
