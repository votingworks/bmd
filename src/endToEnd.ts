import { VotesDict } from '@votingworks/ballot-encoder'

const hardWiredTracker =
  'Quill X8TP7 Home 4X815 Tree EB5Q2 Elephant M8MDP Cup 8D33U Balloon YN31A Frame PHK3X Link T98RV Dancer'

export default function encryptAndGetTracker(
  // eslint-disable-next-line
    votes: VotesDict
): Promise<string> {
  return new Promise(resolve => {
    window.setTimeout(() => {
      resolve(hardWiredTracker)
    }, 100)
  })
}
