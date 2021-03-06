import * as React from 'react'
import { VoterCardData, electionSample } from '@votingworks/ballot-encoder'
import App, { Props } from './App'
import { Card, MemoryCard } from './utils/Card'
import utcTimestamp from './utils/utcTimestamp'
import { Storage, MemoryStorage } from './utils/Storage'
import { AppStorage } from './AppRoot'
import { Provider, MachineConfig, VxMarkPlusVxPrint } from './config/types'
import { MemoryHardware } from './utils/Hardware'

const ballotStyleId = '12'
const precinctId = '23'
const appPrecinctId = '23'

export function getSampleCard(): Card {
  const voterCardData: VoterCardData = {
    c: utcTimestamp(),
    t: 'voter',
    bs: ballotStyleId,
    pr: precinctId,
  }

  return new MemoryCard().insertCard(JSON.stringify(voterCardData))
}

export function getSampleStorage(): Storage<AppStorage> {
  const election = electionSample
  const ballotCreatedAt = utcTimestamp()

  return new MemoryStorage<AppStorage>({
    state: {
      election,
      appPrecinctId,
      ballotsPrintedCount: 0,
      isLiveMode: true,
      isPollsOpen: true,
      ballotCreatedAt,
      ballotStyleId,
      precinctId,
    },

    election,
    activation: {
      ballotCreatedAt,
      ballotStyleId,
      precinctId,
    },
  })
}

export function getSampleMachineConfigProvider(): Provider<MachineConfig> {
  return {
    async get() {
      return { appMode: VxMarkPlusVxPrint, machineId: '012' }
    },
  }
}

/* istanbul ignore next */
const SampleApp = ({
  card = getSampleCard(),
  storage = getSampleStorage(),
  machineConfig = getSampleMachineConfigProvider(),
  hardware = MemoryHardware.demo,
  ...rest
}: Props) => (
  <App
    card={card}
    storage={storage}
    machineConfig={machineConfig}
    hardware={hardware}
    {...rest}
  />
)

export default SampleApp
