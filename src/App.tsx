import React, { useState, useCallback } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import 'normalize.css'
import './App.css'

import FocusManager from './components/FocusManager'

import AppRoot from './AppRoot'
import {
  ScreenReader,
  AriaScreenReader,
  SpeechSynthesisTextToSpeech,
  NullTextToSpeech,
  TextToSpeech,
} from './utils/ScreenReader'

/* istanbul ignore next - unsure how to test */
window.oncontextmenu = (e: MouseEvent): void => {
  e.preventDefault()
}

export interface Props {
  tts?: {
    enabled: TextToSpeech
    disabled: TextToSpeech
  }
}

const App = ({
  tts = {
    enabled: new SpeechSynthesisTextToSpeech(),
    disabled: new NullTextToSpeech(),
  },
}: Props) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)
  const [screenReader, setScreenReader] = useState<ScreenReader>(
    new AriaScreenReader(tts.disabled)
  )

  /* istanbul ignore next - need to figure out how to test this */
  const onKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'r') {
        if (screenReaderEnabled) {
          screenReader.onScreenReaderDisabled()
          setScreenReader(new AriaScreenReader(tts.disabled))
          setScreenReaderEnabled(false)
        } else {
          const newScreenReader = new AriaScreenReader(tts.enabled)
          setScreenReader(newScreenReader)
          setScreenReaderEnabled(true)
          newScreenReader.onScreenReaderEnabled()
        }
      }
    },
    [
      screenReader,
      setScreenReader,
      screenReaderEnabled,
      setScreenReaderEnabled,
      tts.disabled,
      tts.enabled,
    ]
  )

  /* istanbul ignore next - need to figure out how to test this */
  const onClick = useCallback(
    ({ target }: React.MouseEvent) => {
      if (target) {
        const currentPath = window.location.pathname

        setImmediate(() => {
          // Only send `onClick` to the screen reader if the click didn't
          // trigger navigation.
          if (window.location.pathname === currentPath) {
            screenReader.onClick(target)
          }
        })
      }
    },
    [screenReader]
  )

  /* istanbul ignore next - need to figure out how to test this */
  const onFocus = useCallback(
    ({ target }: React.FocusEvent) => {
      if (target) {
        const currentPath = window.location.pathname

        setImmediate(() => {
          // Only send `onFocus` to the screen reader if the focus didn't
          // trigger navigation.
          if (window.location.pathname === currentPath) {
            screenReader.onFocus(target)
          }
        })
      }
    },
    [screenReader]
  )

  return (
    <BrowserRouter>
      <FocusManager
        screenReader={screenReader}
        onKeyPress={onKeyPress}
        onClickCapture={onClick}
        onFocusCapture={onFocus}
      >
        <Route path="/" component={AppRoot} />
      </FocusManager>
    </BrowserRouter>
  )
}

export default App
