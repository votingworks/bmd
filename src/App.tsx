import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import 'normalize.css'
import './App.css'

import Screen from './components/Screen'

import AppRoot from './AppRoot'
import QRCodeTestPage from './pages/QRCodeTestPage'

/* istanbul ignore next - unsure how to test */
window.oncontextmenu = (e: MouseEvent): void => {
  e.preventDefault()
}

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/qrtest" exact component={QRCodeTestPage} />
      <Screen>
        <Route path="/" component={AppRoot} />
      </Screen>
    </Switch>
  </BrowserRouter>
)

export default App
