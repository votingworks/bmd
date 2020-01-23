import { VotesDict } from '@votingworks/ballot-encoder'

import { E2EAPI } from './config/types'
import fetchJSON from './utils/fetchJSON'

export default async function encryptAndGetTracker(
  // eslint-disable-next-line
  votes: VotesDict
) {
  try {
    const { tracker } = await fetchJSON<E2EAPI>(
      '/electionguard/EncryptBallot',
      {
        method: 'post',
        body: JSON.stringify(votes),
      }
    )
    return tracker
  } catch (error) {
    return
  }
}
