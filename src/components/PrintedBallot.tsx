import React from 'react'
import styled from 'styled-components'
import {
  encodeBallot,
  BallotType,
  CandidateVote,
  YesNoVote,
  OptionalYesNoVote,
  VotesDict,
  CandidateContest,
  YesNoContest,
  Contests,
  Parties,
  Election,
} from '@votingworks/ballot-encoder'

import * as GLOBALS from '../config/globals'

import { findPartyById } from '../utils/find'
import {
  getBallotStyle,
  getContests,
  getPartyPrimaryAdjectiveFromBallotStyle,
  getPrecinctById,
} from '../utils/election'

import QRCode from './QRCode'
import Prose from './Prose'
import Text, { NoWrap } from './Text'

const Ballot = styled.div`
  position: relative;
  page-break-after: always;
  @media screen {
    display: none;
  }
`
const PreHeader = styled.div`
  margin: 0 auto 0.375in;
  text-align: center;
  white-space: nowrap;
  font-size: 1.75rem;
  font-weight: 600;
`
const SealImage = styled.img`
  max-width: 1.1in;
`
const Header = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  border: 0.2rem solid #000000;
  border-width: 0.2rem 0;
  padding: 0.5rem 0;
  & > .seal {
    width: 1.1in;
  }
  & h2 {
    margin-bottom: 0;
  }
  & h3 {
    margin-top: 0;
  }
`
const HeaderContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 1rem 0 0.75rem;
  max-width: 100%;
`
const HeaderData = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
`
const WriteInMarker = styled.div`
  position: absolute;
  top: -1.2rem;
  right: 0;
  background: #000000;
  padding: 0.2rem 0.8rem;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
`
const Content = styled.div`
  flex: 1;
`
const BallotSelections = styled.div`
  columns: 2;
  column-gap: 2rem;
`
const Contest = styled.div`
  border-bottom: 0.01rem solid #000000;
  padding: 0.5rem 0;
  break-inside: avoid;
  page-break-inside: avoid;
`
const ContestProse = styled(Prose)`
  & > h3 {
    font-size: 0.875em;
    font-weight: 400;
  }
`
const NoSelection = () => <Text>no selection</Text>

const TestBallotBanner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  transform: translateY(3in) rotate(-45deg);
  opacity: 0.075;
  z-index: -1;
  text-align: center;
  color: #000000;
  font-size: 2in;
`

const HeaderMetaData = styled.div`
  display: flex;
  justify-content: space-between;
`
const MetaDataItem = styled.div`
  margin-left: 1rem;
  &:first-child {
    margin-left: 0;
  }
`
const MetaDataLabel = styled.div`
  font-variant-caps: small-caps;
`
const MetaDataValue = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
`

const CandidateContestResult = ({
  contest,
  parties,
  vote = [],
}: {
  contest: CandidateContest
  parties: Parties
  vote: CandidateVote
}) => {
  const remainingChoices = contest.seats - vote.length
  return vote === undefined || vote.length === 0 ? (
    <NoSelection />
  ) : (
    <React.Fragment>
      {vote.map(candidate => (
        <Text bold key={candidate.id} wordBreak>
          <strong>{candidate.name}</strong>{' '}
          {candidate.partyId &&
            `/ ${findPartyById(parties, candidate.partyId)!.name}`}
          {candidate.isWriteIn && '(write-in)'}
        </Text>
      ))}
      {!!remainingChoices && (
        <Text italic muted>
          [no selection for {remainingChoices} of {contest.seats} choices]
        </Text>
      )}
    </React.Fragment>
  )
}

const YesNoContestResult = (props: {
  contest: YesNoContest
  vote: OptionalYesNoVote
}) =>
  props.vote ? (
    <Text bold wordBreak>
      <strong>
        {GLOBALS.YES_NO_VOTES[props.vote]}{' '}
        {!!props.contest.shortTitle && `on ${props.contest.shortTitle}`}
      </strong>
    </Text>
  ) : (
    <NoSelection />
  )

interface Props {
  ballotStyleId: string
  election: Election
  isLiveMode: boolean
  precinctId: string
  votes: VotesDict
  ballotId: string
}

const PrintBallot = ({
  ballotStyleId,
  election,
  isLiveMode,
  precinctId,
  votes,
  ballotId,
}: Props) => {
  const { county, date, seal, sealURL, state, parties, title } = election
  const partyPrimaryAdjective = getPartyPrimaryAdjectiveFromBallotStyle({
    ballotStyleId,
    election,
  })
  const ballotStyle = getBallotStyle({ ballotStyleId, election })
  const contests = getContests({ ballotStyle, election })
  const precinct = getPrecinctById({ election, precinctId })!
  const encodedBallot = encodeBallot({
    election,
    precinct,
    ballotId,
    ballotStyle,
    votes,
    isTestBallot: !isLiveMode,
    ballotType: BallotType.Standard,
  })
  const hasWriteIns: boolean = Object.values(votes)
    .flat()
    .some(v => v.isWriteIn)

  return (
    <Ballot aria-hidden>
      <PreHeader>
        {isLiveMode ? (
          'This is your official ballot. Verify, then cast in ballot box.'
        ) : (
          <span>
            This is your{' '}
            <Text as="span" muted>
              TEST ballot
            </Text>
            . Verify, then cast in ballot box.
          </span>
        )}
      </PreHeader>
      <Header>
        {seal ? (
          <div
            className="seal"
            // TODO: Sanitize the SVG content: https://github.com/votingworks/bmd/issues/99
            dangerouslySetInnerHTML={{ __html: seal }} // eslint-disable-line react/no-danger
          />
        ) : sealURL ? (
          <div className="seal">
            <SealImage src={sealURL} alt="" />
          </div>
        ) : (
          <React.Fragment />
        )}
        <HeaderContent>
          <HeaderData>
            <Prose>
              <h3>
                {partyPrimaryAdjective} {title}{' '}
                {isLiveMode ? (
                  'Official Ballot'
                ) : (
                  <Text as="span" muted>
                    TEST Ballot
                  </Text>
                )}
              </h3>
              <p>
                {county.name}, {state}
                <br />
                {date}
              </p>
            </Prose>
          </HeaderData>
          <HeaderMetaData>
            <MetaDataItem>
              <MetaDataLabel>polling place</MetaDataLabel>
              <MetaDataValue>{precinct.name}</MetaDataValue>
            </MetaDataItem>
            <MetaDataItem>
              <MetaDataLabel>ballot style</MetaDataLabel>
              <MetaDataValue>{ballotStyleId}</MetaDataValue>
            </MetaDataItem>
            <MetaDataItem>
              <MetaDataLabel>ballot id</MetaDataLabel>
              <MetaDataValue>
                <NoWrap>{ballotId}</NoWrap>
              </MetaDataValue>
            </MetaDataItem>
          </HeaderMetaData>
        </HeaderContent>
        <QRCode size="1.1in" value={encodedBallot} />
        {hasWriteIns && <WriteInMarker>ballot has write-ins</WriteInMarker>}
      </Header>
      <Content>
        <BallotSelections>
          {(contests as Contests).map(contest => (
            <Contest key={contest.id}>
              <ContestProse compact>
                <h3>{contest.title}</h3>
                {contest.type === 'candidate' && (
                  <CandidateContestResult
                    contest={contest}
                    parties={parties}
                    vote={votes[contest.id] as CandidateVote}
                  />
                )}
                {contest.type === 'yesno' && (
                  <YesNoContestResult
                    contest={contest}
                    vote={votes[contest.id] as YesNoVote}
                  />
                )}
              </ContestProse>
            </Contest>
          ))}
        </BallotSelections>
      </Content>
      {!isLiveMode && <TestBallotBanner>TEST BALLOT</TestBallotBanner>}
    </Ballot>
  )
}

export default PrintBallot
