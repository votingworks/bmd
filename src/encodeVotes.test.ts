import { Election, VotesDict } from './config/types'

import { encodeVotes, decodeVotes } from './encodeVotes'

import electionSample from './data/electionSample.json'
import { Uint1, Uint8Size, toUint8, Uint8 } from './utils/bits'

const election = electionSample as Election

function uint8ArrayFromBitArray(bits: Uint1[]): Uint8Array {
  const bytes: Uint8[] = []
  const extraBits = bits.length % Uint8Size
  const paddedLength =
    extraBits === 0 ? bits.length : bits.length + Uint8Size - extraBits

  for (let i = 0; i < paddedLength; i += Uint8Size) {
    const string = bits
      .slice(i, i + Uint8Size)
      .join('')
      .padEnd(Uint8Size, '0')
    bytes.push(toUint8(parseInt(string, 2)))
  }

  return Uint8Array.of(...bytes)
}

it('encodes empty votes correctly', () => {
  const votes: VotesDict = {}
  const votesPresent: Uint1[] = new Array(election.contests.length).fill(0)

  expect(encodeVotes(election.contests, votes)).toEqual(
    uint8ArrayFromBitArray(votesPresent)
  )
})

it('encodes yesno votes correctly', () => {
  const votes: VotesDict = {
    '102': 'yes',
    'judicial-robert-demergue': 'yes',
    'judicial-elmer-hull': 'yes',
    'question-a': 'yes',
    'question-b': 'yes',
    'question-c': 'yes',
    'proposition-1': 'yes',
    'measure-101': 'yes',
    'measure-666': 'yes',
  }

  expect(encodeVotes(election.contests, votes)).toEqual(
    uint8ArrayFromBitArray([
      /* eslint-disable prettier/prettier */

      /** ROLL CALL **/
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,

      /** VOTE DATA **/
      // 102
      1,
      // judicial-robert-demergue
      1,
      // judicial-elmer-hull
      1,
      // question-a
      1,
      // question-b
      1,
      // question-c
      1,
      // proposition-1
      1,
      // measure-101
      1,
      // measure-666
      1,

      /* eslint-enable prettier/prettier */
    ])
  )
})

it('encodes candidate choice votes correctly', () => {
  /* eslint-disable prettier/prettier */
  const votes: VotesDict = {
    'president': [{ id: 'barchi-hallaren', name: 'Joseph Barchi and Joseph Hallaren' }],
    'senator': [{ id: 'weiford', name: 'Dennis Weiford' }],
    'representative-district-6': [{ id: 'plunkard', name: 'Brad Plunkard' }],
    'governor': [{ id: 'franz', name: 'Charlene Franz' }],
    'lieutenant-governor': [{ id: 'norberg', name: 'Chris Norberg' }],
    'secretary-of-state': [{ id: 'shamsi', name: 'Laila Shamsi' }],
    'state-senator-district-31': [{ id: 'shiplett', name: 'Edward Shiplett' }],
    'state-assembly-district-54': [{ id: 'solis', name: 'Andrea Solis' }],
    'county-commissioners': [{ id: 'argent', name: 'Camille Argent' }],
    'county-registrar-of-wills': [{ id: 'ramachandrani', name: 'Rhadka Ramachandrani' }],
    'city-mayor': [{ id: 'white', name: 'Orville White' }],
    'city-council': [{ id: 'eagle', name: 'Harvey Eagle' }],
    'primary-constitution-head-of-party': [{ id: 'alice', name: 'Alice Jones' }],
  }
  /* eslint-enable prettier/prettier */

  expect(encodeVotes(election.contests, votes)).toEqual(
    uint8ArrayFromBitArray([
      /* eslint-disable prettier/prettier */

      /** ROLL CALL **/
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,

      /** VOTE DATA **/

      // president
      1, 0, 0, 0, 0, 0,

      // senator
      1, 0, 0, 0, 0, 0, 0,

      // representative-district-6
      1, 0, 0, 0, 0,

      // governor
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

      // lieutenant-governor
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      
      // secretary-of-state
      1, 0,

      // state-senator-district-31
      1,

      // state-assembly-district-54
      1, 0, 0,

      // county-commisioners (+ write-in count, 4 seats)
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0,

      // county-registrar-of-wills (+ write-in count, 1 seat)
      1,
      0,

      // city-mayor (+ write-in count, 1 seat)
      1, 0,
      0,

      // city-council (+ write-in count, 3 seats)
      1, 0, 0, 0, 0, 0,
      0, 0,

      // primary-constitution-head-of-party
      1, 0,
    ])
    /* eslint-enable prettier/prettier */
  )
})

it('encodes a ballot with mixed vote types correctly', () => {
  /* eslint-disable prettier/prettier */
  const votes: VotesDict = {
    '102': 'yes',
    'judicial-robert-demergue': 'yes',
    'judicial-elmer-hull': 'yes',
    'question-a': 'yes',
    'question-b': 'yes',
    'question-c': 'yes',
    'proposition-1': 'yes',
    'measure-101': 'yes',
    'measure-666': 'yes',
    'president': [{ id: 'barchi-hallaren', name: 'Joseph Barchi and Joseph Hallaren' }],
    'senator': [{ id: 'weiford', name: 'Dennis Weiford' }],
    'representative-district-6': [{ id: 'plunkard', name: 'Brad Plunkard' }],
    'governor': [{ id: 'franz', name: 'Charlene Franz' }],
    'lieutenant-governor': [{ id: 'norberg', name: 'Chris Norberg' }],
    'secretary-of-state': [{ id: 'shamsi', name: 'Laila Shamsi' }],
    'state-senator-district-31': [{ id: 'shiplett', name: 'Edward Shiplett' }],
    'state-assembly-district-54': [{ id: 'solis', name: 'Andrea Solis' }],
    'county-commissioners': [{ id: 'argent', name: 'Camille Argent' }],
    'county-registrar-of-wills': [{ id: 'ramachandrani', name: 'Rhadka Ramachandrani' }],
    'city-mayor': [{ id: 'white', name: 'Orville White' }],
    'city-council': [{ id: 'eagle', name: 'Harvey Eagle' }],
    'primary-constitution-head-of-party': [{ id: 'alice', name: 'Alice Jones' }],
  }
  /* eslint-enable prettier/prettier */

  expect(encodeVotes(election.contests, votes)).toEqual(
    uint8ArrayFromBitArray([
      /* eslint-disable prettier/prettier */

      /** ROLL CALL **/
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

      /** VOTE DATA **/

      // president
      1, 0, 0, 0, 0, 0,

      // senator
      1, 0, 0, 0, 0, 0, 0,

      // representative-district-6
      1, 0, 0, 0, 0,

      // governor
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

      // lieutenant-governor
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      
      // secretary-of-state
      1, 0,

      // state-senator-district-31
      1,

      // state-assembly-district-54
      1, 0, 0,

      // county-commisioners (+ write-in count, 4 seats)
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0,

      // county-registrar-of-wills (+ write-in count, 1 seat)
      1,
      0,

      // city-mayor (+ write-in count, 1 seat)
      1, 0,
      0,

      // city-council (+ write-in count, 3 seats)
      1, 0, 0, 0, 0, 0,
      0, 0,

      // 102
      1,
      // judicial-robert-demergue
      1,
      // judicial-elmer-hull
      1,
      // question-a
      1,
      // question-b
      1,
      // question-c
      1,
      // proposition-1
      1,
      // measure-101
      1,
      // measure-666
      1,

      // primary-constitution-head-of-party
      1, 0,
    ])
    /* eslint-enable prettier/prettier */
  )
})

it('encodes write-in votes correctly', () => {
  /* eslint-disable prettier/prettier */
  const votes: VotesDict = {
    'county-registrar-of-wills': [{ id: 'write-in__MICKEY MOUSE', name: 'MICKEY MOUSE', isWriteIn: true }]
  }
  /* eslint-enable prettier/prettier */

  expect(encodeVotes(election.contests, votes)).toEqual(
    uint8ArrayFromBitArray([
      /* eslint-disable prettier/prettier */

      /** ROLL CALL **/
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

      /** VOTE DATA **/
      // county-registrar-of-wills
      0,                 // 1st candidate not selected
      1,                 // # of write-ins
      0, 0, 1, 1, 0, 0,  // write-in length
      0, 1, 1, 0, 0,     // M
      0, 1, 0, 0, 0,     // I
      0, 0, 0, 1, 0,     // C
      0, 1, 0, 1, 0,     // K
      0, 0, 1, 0, 0,     // E
      1, 1, 0, 0, 0,     // Y
      1, 1, 0, 1, 0,     // ␣ 
      0, 1, 1, 0, 0,     // M
      0, 1, 1, 1, 0,     // O
      1, 0, 1, 0, 0,     // U
      1, 0, 0, 1, 0,     // S
      0, 0, 1, 0, 0,     // E

      /* eslint-enable prettier/prettier */
    ])
  )
})

it('round-trips empty votes correctly', () => {
  const votes: VotesDict = {}

  expect(
    decodeVotes(election.contests, encodeVotes(election.contests, votes))
  ).toEqual(votes)
})

it('round-trips yesno votes correctly', () => {
  const votes: VotesDict = {
    '102': 'yes',
    'judicial-robert-demergue': 'yes',
    'judicial-elmer-hull': 'yes',
    'question-a': 'yes',
    'question-b': 'yes',
    'question-c': 'yes',
    'proposition-1': 'yes',
    'measure-101': 'yes',
    'measure-666': 'yes',
  }

  expect(
    decodeVotes(election.contests, encodeVotes(election.contests, votes))
  ).toEqual(votes)
})

it('round-trips candidate votes correctly', () => {
  /* eslint-disable prettier/prettier */
  const votes: VotesDict = {
    'president': [{ id: 'barchi-hallaren', name: 'Joseph Barchi and Joseph Hallaren', partyId: '0' }],
    'senator': [{ id: 'weiford', name: 'Dennis Weiford', partyId: '0' }],
    'representative-district-6': [{ id: 'plunkard', name: 'Brad Plunkard', partyId: '0' }],
    'governor': [{ id: 'franz', name: 'Charlene Franz', partyId: '0' }],
    'lieutenant-governor': [{ id: 'norberg', name: 'Chris Norberg', partyId: '0' }],
    'secretary-of-state': [{ id: 'shamsi', name: 'Laila Shamsi', partyId: '0' }],
    'state-senator-district-31': [{ id: 'shiplett', name: 'Edward Shiplett', partyId: '3' }],
    'state-assembly-district-54': [{ id: 'solis', name: 'Andrea Solis', partyId: '0' }],
    'county-commissioners': [{ id: 'argent', name: 'Camille Argent', partyId: '0' }],
    'county-registrar-of-wills': [{ id: 'ramachandrani', name: 'Rhadka Ramachandrani', partyId: '6' }],
    'city-mayor': [{ id: 'white', name: 'Orville White', partyId: '1' }],
    'city-council': [{ id: 'eagle', name: 'Harvey Eagle', partyId: '0' }],
    'primary-constitution-head-of-party': [{ id: 'alice', name: 'Alice Jones', partyId: '3' }],
  }
  /* eslint-enable prettier/prettier */

  expect(
    decodeVotes(election.contests, encodeVotes(election.contests, votes))
  ).toEqual(votes)
})
