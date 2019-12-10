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

export async function deleteElectionGuardBallots() {
  try {
    const now = new Date()
    const filename =
      'encrypted-ballots_' +
      now.getFullYear() +
      '_' +
      (now.getMonth() + 1) +
      '_' +
      now.getDate()

    fetch('/electionguard/BallotFile?fileName=' + filename, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (error) {
    return
  }
}
