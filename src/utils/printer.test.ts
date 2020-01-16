import { mockOf } from '../../test/testUtils'
import getPrinter, { LocalPrinter, NullPrinter } from './printer'
import fakeKiosk from '../../test/helpers/fakeKiosk'

const printMock = mockOf(window.print)

test('`getPrinter` makes a kiosk printer if kiosk printing is available', async () => {
  try {
    window.kiosk = fakeKiosk()
    await getPrinter().print()
    expect(window.kiosk.print).toHaveBeenCalledTimes(1)
  } finally {
    window.kiosk = undefined
  }
})

test('`getPrinter` makes a `LocalPrinter` if kiosk printing is unavailable', () => {
  expect(getPrinter()).toBeInstanceOf(LocalPrinter)
})

describe('a local printer', () => {
  it('calls `window.print` when printing', async () => {
    printMock.mockReturnValueOnce(undefined)
    await new LocalPrinter().print()
    expect(window.print).toHaveBeenCalled()
  })
})

describe('a null printer', () => {
  it('does not print to `window.print`', async () => {
    printMock.mockReturnValueOnce(undefined)
    await new NullPrinter().print()
    expect(window.print).not.toHaveBeenCalled()
  })
})
