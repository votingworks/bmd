import { CompletedBallot } from '@votingworks/ballot-encoder'

import { E2EAPI } from './config/types'
import fetchJSON from './utils/fetchJSON'

export default async function encryptBallotWithElectionGuard(
  ballot: CompletedBallot
) {
  try {
    const { tracker } = await fetchJSON<E2EAPI>(
      '/electionguard/EncryptBallot',
      {
        method: 'post',
        body: JSON.stringify({
          ballot,
          currentBallotCount: 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return tracker
  } catch (error) {
    return ''
  }
}
