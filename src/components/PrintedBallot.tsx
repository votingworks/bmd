import React, { useState, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'
import { Previewer, registerHandlers, Handler } from 'pagedjs'
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
  Precinct,
  BallotStyle,
} from '@votingworks/ballot-encoder'

import * as GLOBALS from '../config/globals'

import { Bubble, BubbleMark } from './BubbleMark'
import WriteInLine from './WriteInLine'

import { randomBase64 } from '../utils/random'
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
import getPrintedBallotPageLayout from '../utils/getPrintedBallotPageLayout'

// class CustomHandler extends Handler {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   beforeParsed(content: any) {
//     console.log('beforeParsed content', { content })
//   }
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   afterParsed(content: any) {
//     console.log('afterParsed content', { content })
//   }
// }
// registerHandlers(CustomHandler)

const Ballot = styled.div`
  display: flex;
  flex-direction: column;
  page-break-after: always;
  width: 8.5in;
  min-height: 11in;
  @media screen {
    /* display: none; */
    margin: 0.25in auto;
    outline: 1px solid rgb(255, 0, 255);
    padding: 0.25in 0.25in 0.25in 0.4in;
  }
`

const SealImage = styled.img`
  max-width: 1in;
`

// const HeaderOld = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   border-bottom: 0.2rem solid #000000;
//   & > .seal {
//     margin: 0.25rem 0;
//     width: 1in;
//   }
//   & h2 {
//     margin-bottom: 0;
//   }
//   & h3 {
//     margin-top: 0;
//   }
//   & > .ballot-header-content {
//     flex: 4;
//     margin: 0 1rem;
//     max-width: 100%;
//   }
// `
const Content = styled.div`
  flex: 1;
`
// const PageHeader = styled.div`
//   margin-bottom: 0.5rem;
// `
const PageFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0.125in 0 0 0.23in;
`
const PageFooterMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  border-top: 1px solid #000000;
  & > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    &:first-child {
      padding-top: 0.02rem;
    }
  }
  h2 {
    margin: 0;
    font-size: 1.285rem; /* 18pt */
  }
  sup {
    top: -0.325rem;
    font-size: 0.8rem;
  }
  strong + sup {
    margin-left: 0.5rem;
  }
`
const PageFooterQRCode = styled.div`
  margin-left: 0.125in;
  width: 0.475in;
`
const BallotColumns = styled.div`
  columns: 3;
  column-gap: 1rem;
`
const IntroColumn = styled.div`
  /* position: relative;
  top: -1.5rem; */
  break-after: column;
  break-inside: avoid;
  page-break-inside: avoid;
`
const BallotHeader = styled.div`
  margin-bottom: 2rem;
  & h2 {
    margin-bottom: 0;
  }
  & h3 {
    margin-top: 0;
  }
  & > .seal {
    float: right;
    margin: 0 0 0.25rem 0.25rem;
    width: 1in;
  }
`
const Instructions = styled.div`
  margin-bottom: 1rem;
  border: 0.1rem solid #000000;
  border-width: 0.1rem 0;
  padding: 1rem 0;
  img {
    margin-top: 0.3rem;
  }
`
const Contest = styled.div`
  margin-bottom: 1rem;
  border: 0.05rem solid #000000;
  border-top-width: 0.2rem;
  padding: 0.5rem 1rem 1rem;
  break-inside: avoid;
  page-break-inside: avoid;
`
const ColumnFooter = styled.div`
  /* margin-top: 2rem; */
  /* border: 0.1rem solid #000000; */
`

const ContestSection = styled.div`
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
`

const ballotMetadata = ({
  isLiveMode,
  isTemplate,
  precinctId,
  ballotStyleId,
  pageNumber,
  pageCount,
}: {
  isLiveMode: boolean
  isTemplate: boolean
  precinctId: Precinct['id']
  ballotStyleId: BallotStyle['id']
  pageNumber: number
  pageCount: number
}): string => {
  const params = new URLSearchParams([
    ['t', `${!isLiveMode ? 't' : '_'}${isTemplate ? 't' : '_'}`],
    ['pr', precinctId],
    ['bs', ballotStyleId],
    ['p', `${pageNumber}-${pageCount}`],
  ])
  return new URL(`https://vx.vote/?${params}`).toString()
}

const CandidateContestChoices = ({
  contest,
  parties,
  vote = [],
}: {
  contest: CandidateContest
  parties: Parties
  vote: CandidateVote
}) => {
  const writeInCandidates = vote.filter(c => c.isWriteIn)
  const remainingChoices = [...Array(contest.seats - vote.length).keys()]
  return (
    <React.Fragment>
      {contest.candidates.map(candidate => (
        <Text key={candidate.id} bold data-candidate>
          <BubbleMark checked={vote.some(v => v.id === candidate.id)}>
            <span>
              <strong data-candidate-name={candidate.name}>
                {candidate.name}
              </strong>
              {candidate.partyId && (
                <React.Fragment>
                  <br />
                  {findPartyById(parties, candidate.partyId)!.name}
                </React.Fragment>
              )}
            </span>
          </BubbleMark>
        </Text>
      ))}
      {writeInCandidates.map(candidate => (
        <Text key={candidate.name} bold noWrap>
          <BubbleMark checked>
            <span>
              <strong>{candidate.name}</strong> (write-in)
            </span>
          </BubbleMark>
        </Text>
      ))}
      {contest.allowWriteIns &&
        remainingChoices.map(k => (
          <Text key={k} bold noWrap data-write-in>
            <BubbleMark>
              <strong>write-in:</strong>
              <WriteInLine />
            </BubbleMark>
          </Text>
        ))}
    </React.Fragment>
  )
}

const YesNoContestChoices = (props: {
  contest: YesNoContest
  vote: OptionalYesNoVote
}) => (
  <React.Fragment>
    {['Yes', 'No'].map(answer => (
      <Text key={answer} bold noWrap>
        <BubbleMark checked={props.vote === answer.toLowerCase()}>
          {GLOBALS.YES_NO_VOTES[answer.toLowerCase() as YesNoVote]}
        </BubbleMark>
      </Text>
    ))}
  </React.Fragment>
)

interface Props {
  ballotStyleId: string
  election: Election
  isLiveMode: boolean
  isTemplate?: boolean
  precinctId: string
  votes: VotesDict
}

const PrintBallot = ({
  ballotStyleId,
  election,
  isLiveMode,
  isTemplate = false,
  precinctId,
  votes,
}: Props) => {
  const ballotId = randomBase64()
  const { county, date, seal, sealURL, state, parties, title } = election
  const partyPrimaryAdjective = getPartyPrimaryAdjectiveFromBallotStyle({
    ballotStyleId,
    election,
  })
  const ballotStyle = getBallotStyle({ ballotStyleId, election })
  const contests = getContests({ ballotStyle, election })
  // const sections = [...new Set(contests.map(c => c.section))]
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
  const [ballotRendered, setBallotRendered] = useState(false)

  useLayoutEffect(() => {
    if (!ballotRendered) {
      const previewer = new Previewer()
      previewer
        .preview(
          document.querySelector('#screen-ballot')!.innerHTML,
          ['/ballot/ballot.css'],
          document.querySelector('#print-ballot')
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((flow: { total: any }) => {
          console.log('preview rendered, total pages', flow.total, { flow })
        })
      setBallotRendered(true)
      return () => {
        console.log('removing pagedjs ballot')
        document.querySelector('#print-ballot')!.innerHTML = ''
      }
    }
  })

  // eslint-disable-next-line no-restricted-syntax
  const ballotRef = useRef<HTMLDivElement>(null)

  // useLayoutEffect(() => {
  //   if (ballotRef.current) {
  //     // eslint-disable-next-line no-console
  //     console.log(
  //       `Printed ballot page layout: ${JSON.stringify(
  //         getPrintedBallotPageLayout(ballotRef.current),
  //         undefined,
  //         2
  //       )}`
  //     )
  //   }
  // })

  return (
    <React.Fragment>
      <Ballot id="screen-ballot" aria-hidden data-ballot ref={ballotRef}>
        <div className="ballot-footer">
          <PageFooter>
            <PageFooterMain>
              <Prose maxWidth={false} compact>
                <Text as="h2" normal>
                  <sup>Precinct:</sup> <strong>{precinct.name}</strong>{' '}
                  <sup>Style:</sup> <strong>{ballotStyle.id}</strong>
                </Text>
                <Text as="h2" normal>
                  <strong>
                    Page <span className="ballot-footer-page-number" />
                  </strong>{' '}
                  of <span className="ballot-footer-pages-number" />
                </Text>
              </Prose>
              <Prose maxWidth={false} compact>
                <Text>
                  {isLiveMode ? 'Official Ballot' : 'Unofficial TEST Ballot'}{' '}
                  for
                  {partyPrimaryAdjective} {title}
                </Text>
                <Text>
                  {county.name}, {state}
                </Text>
                <Text>{date}</Text>
              </Prose>
            </PageFooterMain>
            <PageFooterQRCode>
              <QRCode
                level="L"
                value={ballotMetadata({
                  isLiveMode,
                  isTemplate,
                  precinctId,
                  ballotStyleId,
                  pageNumber: 1,
                  pageCount: 2,
                })}
              />
            </PageFooterQRCode>
            <PageFooterQRCode>
              <QRCode
                level="L"
                value={ballotMetadata({
                  isLiveMode,
                  isTemplate,
                  precinctId,
                  ballotStyleId,
                  pageNumber: 2,
                  pageCount: 2,
                })}
              />
            </PageFooterQRCode>
          </PageFooter>
        </div>

        <Content>
          {/* <PageHeader>
          <Prose maxWidth={false}>
            <Text right>
              Ballot Style: {ballotStyle.id} — <strong>Page 1</strong> of 3
            </Text>
          </Prose>
        </PageHeader> */}
          <BallotColumns>
            <IntroColumn>
              <BallotHeader>
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
                <Prose>
                  <h2>
                    {isLiveMode ? 'Official Ballot' : 'Unofficial TEST Ballot'}
                  </h2>
                  <h3>
                    {partyPrimaryAdjective} {title}
                  </h3>
                  <p>
                    {state}
                    <br />
                    {county.name}
                    <br />
                    {date}
                  </p>
                </Prose>
              </BallotHeader>
              <Instructions>
                <Prose>
                  <h3>Instructions</h3>
                  <p>
                    To vote, use a black pen to completely fill in the oval to
                    the left of your choice.
                    <img src="/ballot/instructions-fill-oval.svg" alt="" />
                  </p>
                  <p>
                    To vote for a person not on the ballot, completely fill in
                    the oval to the left of “write-in” and then write the
                    person’s name on the line provided.
                    <img src="/ballot/instructions-write-in.svg" alt="" />
                  </p>
                  <p>
                    To correct any errors or mistakes, please request a
                    replacement ballot. Any marks other than filled ovals may
                    cause your votes not to be counted.
                  </p>
                </Prose>
              </Instructions>
            </IntroColumn>
            {/* {sections.map(section => <Section>
          <h1>{section}</h1>

          </Section>)} */}
            {(contests as Contests).map(
              (contest, i) =>
                i < 999 && (
                  <Contest
                    key={contest.id}
                    data-contest
                    data-contest-title={contest.title}
                  >
                    <Prose>
                      <h3>
                        <ContestSection>{contest.section}</ContestSection>
                        {contest.title}
                      </h3>
                      {contest.type === 'candidate' && (
                        <React.Fragment>
                          <p>
                            {contest.seats === 1
                              ? 'Vote for 1.'
                              : `⚠ Vote for not more than ${contest.seats}.`}
                          </p>
                          <CandidateContestChoices
                            contest={contest}
                            parties={parties}
                            vote={votes[contest.id] as CandidateVote}
                          />
                        </React.Fragment>
                      )}
                      {contest.type === 'yesno' && (
                        <React.Fragment>
                          <p>
                            Vote <strong>Yes</strong> or <strong>No</strong>.
                          </p>
                          <p>{contest.description}</p>
                          <YesNoContestChoices
                            contest={contest}
                            vote={votes[contest.id] as YesNoVote}
                          />
                        </React.Fragment>
                      )}
                    </Prose>
                  </Contest>
                )
            )}
            <ColumnFooter>
              <Prose>
                {/* <p>Continue voting on the next page. →</p> */}
                <h3>Thank you for voting.</h3>
                <p>
                  Review your ballot before casting it. You may request a
                  replacement ballot to correct any errors or mistakes.
                </p>
              </Prose>
            </ColumnFooter>
          </BallotColumns>
        </Content>
      </Ballot>
      <div id="print-ballot" />
    </React.Fragment>
  )
}

export default PrintBallot
