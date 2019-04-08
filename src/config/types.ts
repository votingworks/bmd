// Generic
export interface Dictionary<T> {
  [key: string]: T | undefined
}

// Events
export type InputEvent = React.FormEvent<EventTarget>
export type ButtonEvent = React.MouseEvent<HTMLButtonElement>

// UI
export type ScrollDirections = 'up' | 'down'

// Election
export interface Candidate {
  readonly id: string
  readonly name: string
  readonly party?: string
  isWriteIn?: boolean
}
export type OptionalCandidate = Candidate | undefined

// Votes
export type CandidateVote = Candidate[]
export type YesNoVote = 'yes' | 'no'
export type Vote = CandidateVote | YesNoVote
export type OptionalVote = Candidate[] | undefined
export type VotesDict = Dictionary<Vote>

// Contests
export type ContestTypes = 'candidate' | 'yesno'
export interface Contest {
  readonly id: string
  readonly section: string
  readonly title: string
  readonly type: ContestTypes
}
export interface CandidateContest extends Contest {
  readonly type: 'candidate'
  readonly seats: number
  readonly candidates: Candidate[]
  readonly allowWriteIns: boolean
}
export interface YesNoContest extends Contest {
  readonly type: 'yesno'
  readonly description: string
}

// Election
export interface BMDConfig {
  readonly requireActivation?: boolean
  readonly showHelpPage?: boolean
  readonly showSettingsPage?: boolean
}
export interface ElectionDefaults {
  readonly bmdConfig: BMDConfig
}
export interface Election {
  readonly contests: (CandidateContest | YesNoContest)[]
  readonly county: string
  readonly date: string
  readonly seal: string
  readonly state: string
  readonly title: string
  readonly bmdConfig?: BMDConfig
}
export type OptionalElection = Election | undefined

export type TextSizeSetting = 0 | 1 | 2 | 3

export interface UserSettings {
  textSize: TextSizeSetting
}
export type PartialUserSettings = Partial<UserSettings>

// Ballot
export type UpdateVoteFunction = (contestId: string, vote: Vote) => void
export interface BallotContextInterface {
  readonly election: Election | undefined
  resetBallot: (path?: string) => void
  setBallotKey: (activationCode: string) => void
  updateVote: UpdateVoteFunction
  votes: VotesDict
  setUserSettings: (partial: PartialUserSettings) => void
  userSettings: UserSettings
}

export default {}
