import {VotesDict} from './config/types'

const hardWiredTracker =
  'Quill X8TP7 Home 4X815 Tree EB5Q2 Elephant M8MDP Cup 8D33U Balloon YN31A Frame PHK3X Link T98RV Dancer'

export function encryptAndGetTracker(votes : VotesDict) : Promise<string> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve(hardWiredTracker)
    }, 100)
  })
}
