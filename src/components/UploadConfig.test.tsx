import React from 'react'
import { fireEvent, render, wait } from 'react-testing-library'

import electionSample from '../data/electionSample.json'

import { mergeWithDefaults } from '../App'
import { Election } from '../config/types'

const goodElectionFile = mergeWithDefaults(electionSample as Election)

import UploadConfig from './UploadConfig'

function mockData(files: any) {
  return {
    dataTransfer: {
      files,
      items: files.map((file: any) => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  }
}

it(`allows file to be uploaded via file input`, async () => {
  const setElection = jest.fn()
  const { container, getByText, getByTestId } = render(
    <UploadConfig setElection={setElection} />
  )
  const fileInput = getByTestId('file-input')
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File(
          [JSON.stringify(goodElectionFile)],
          'beausfavoriteelection.json',
          {
            type: 'application/json',
          }
        ),
      ],
    },
  })
  await wait(() => getByText('Loading file…'))
  await wait(() => getByText('File loaded'))
  expect(setElection).toHaveBeenCalled()
  expect(container.firstChild).toMatchSnapshot()
})

it(`allows file to be uploaded via drag and drop`, async () => {
  const file = new File([JSON.stringify(goodElectionFile)], 'election.json', {
    type: 'application/json',
  })
  const data = mockData([file])

  const setElection = jest.fn()
  const { container, getByText, getByTestId } = render(
    <UploadConfig setElection={setElection} />
  )
  const dropzone = getByTestId('dropzone')
  fireEvent.dragEnter(dropzone, data)
  await wait(() => getByText('Drop files here…'))
  fireEvent.drop(dropzone, {
    target: {
      files: [
        new File([JSON.stringify(goodElectionFile)], 'election.json', {
          type: 'application/json',
        }),
      ],
    },
  })
  await wait(() => getByText('Loading file…'))
  await wait(() => getByText('File loaded'))
  expect(setElection).toHaveBeenCalled()
  expect(container.firstChild).toMatchSnapshot()
})

it(`allows one-click config`, async () => {
  const setElection = jest.fn()
  const { getByText } = render(<UploadConfig setElection={setElection} />)
  fireEvent.click(getByText('Load Sample Election File'))
  expect(setElection).toHaveBeenCalled()
})

it(`doesn't allow files with names that don't end in '.json'`, async () => {
  const setElection = jest.fn()
  const { getByText, getByTestId } = render(
    <UploadConfig setElection={setElection} />
  )
  const fileInput = getByTestId('file-input')
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File([''], 'foo.js', {
          type: 'application/json',
        }),
      ],
    },
  })
  await wait(() =>
    getByText('Only files that end in ".json" are accepted. Try again.')
  )
})

it(`doesn't allow upload of multiple files`, async () => {
  const setElection = jest.fn()
  const { getByText, getByTestId } = render(
    <UploadConfig setElection={setElection} />
  )
  const fileInput = getByTestId('file-input')
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File([''], 'one.json', {
          type: 'application/json',
        }),
        new File([''], 'two.json', {
          type: 'application/json',
        }),
      ],
    },
  })
  await wait(() =>
    getByText('Only files that end in ".json" are accepted. Try again.')
  )
})

it(`election config file must contain json content`, async () => {
  const setElection = jest.fn()
  const { getByText, getByTestId } = render(
    <UploadConfig setElection={setElection} />
  )
  const fileInput = getByTestId('file-input')
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File(['asdf'], 'election.json', {
          type: 'application/json',
        }),
      ],
    },
  })
  await wait(() => getByText('File content must be JSON text only. Try again.'))
})
