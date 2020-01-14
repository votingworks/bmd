import { mockOf } from '../../test/testUtils'
import fakeVoice from '../../test/helpers/fakeVoice'
import { chooseUSEnglishVoice } from './voices'

describe('chooseUSEnglishVoice', () => {
  it('returns nothing given no voices', () => {
    expect(chooseUSEnglishVoice([])).toBeUndefined()
  })

  it('never returns non-local voices', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ localService: false, name: 'Google US English' }),
      ])
    ).toBeUndefined()
  })

  it.each([
    'cmu_us_slt_arctic_hts festival',
    'cmu_us_slt_arctic_clunits festival',
  ])('prefers the CMU voice "%s"', name => {
    expect(
      chooseUSEnglishVoice([
        // Preferred over default
        fakeVoice({ default: true }),
        // Preferred over US English
        fakeVoice({ name: 'US English' }),
        // Preferred over English
        fakeVoice({ name: 'English' }),
        // Preferred over lang matches
        fakeVoice({ lang: 'en-US' }),
        fakeVoice({ name }),
      ])?.name
    ).toBe(name)
  })

  it('prefers US English to UK English', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ name: 'Google UK English' }),
        fakeVoice({ name: 'Google US English' }),
      ])?.name
    ).toBe('Google US English')
  })

  it('prefers en-US over en', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ lang: 'en' }),
        fakeVoice({ lang: 'en-US' }),
      ])?.lang
    ).toBe('en-US')
  })

  it('prefers en over en-GB', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ lang: 'en-GB' }),
        fakeVoice({ lang: 'en' }),
      ])?.lang
    ).toBe('en')
  })

  it('falls back to the default if there is one', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ lang: 'af', default: false }),
        fakeVoice({ default: true }),
        fakeVoice({ name: 'Google 普通话（中国大陆）', default: false }),
      ])?.default
    ).toBe(true)
  })

  it('falls back to the first one if none match or are the default', () => {
    expect(
      chooseUSEnglishVoice([
        fakeVoice({ lang: 'af', default: false }),
        fakeVoice({ name: 'Google 普通话（中国大陆）', default: false }),
      ])?.lang
    ).toBe('af')
  })
})
