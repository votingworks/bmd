import fetchMock from 'fetch-mock'
import machineConfigProvider from './machineConfig'
import { VxMarkOnly, VxMarkPlusVxPrint, VxPrintOnly } from '../config/types'

test('successful VxMark fetch from /machine-config', async () => {
  fetchMock.get('/machine-config', () =>
    JSON.stringify({ appMode: 'VxMark', machineId: '1' })
  )
  expect(await machineConfigProvider.get()).toEqual({
    appMode: VxMarkOnly,
    machineId: '1',
  })
})

test('successful VxPrint fetch from /machine-config', async () => {
  fetchMock.get('/machine-config', () =>
    JSON.stringify({ appMode: 'VxPrint', machineId: '1' })
  )
  expect(await machineConfigProvider.get()).toEqual({
    appMode: VxPrintOnly,
    machineId: '1',
  })
})

test('successful VxMark + VxPrint fetch from /machine-config', async () => {
  fetchMock.get('/machine-config', () =>
    JSON.stringify({ appMode: 'VxMark + VxPrint', machineId: '1' })
  )
  expect(await machineConfigProvider.get()).toEqual({
    appMode: VxMarkPlusVxPrint,
    machineId: '1',
  })
})

test('failed fetch from /machine-config', () => {
  fetchMock.get('/machine-config', {
    throws: new Error('fetch failed!'),
  })
  expect(machineConfigProvider.get()).rejects.toThrowError('fetch failed!')
})
