import pluralize from 'pluralize'
import React from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'

import {
  ButtonEvent,
  Candidate,
  CandidateContest,
  CandidateVote,
  OptionalYesNoVote,
  ScrollDirections,
  YesNoContest,
  YesNoVote,
} from '../config/types'

import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import LinkButton from '../components/LinkButton'
import Main from '../components/Main'
import Prose from '../components/Prose'
import Text from '../components/Text'
import GLOBALS from '../config/globals'
import BallotContext from '../contexts/ballotContext'

const tabletMinWidth = 768

const ContentHeader = styled.div`
  width: 100%;
  max-width: 35rem;
  margin: 0px auto;
  padding: 0.5rem 0.5rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding: 0.5rem 1rem;
  }
`
const ContentFooter = styled.div`
  width: 100%;
  max-width: 35rem;
  margin: 0px auto;
  padding: 0.5rem 0.5rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding: 0.5rem 1rem;
  }
`
const VariableContentContainer = styled.div<{
  showBottomShadow: boolean
  showTopShadow: boolean
}>`
  display: flex;
  flex: 1;
  position: relative;
  overflow: auto;
  &:before,
  &:after {
    content: '';
    z-index: 1;
    transition: opacity 0.25s ease;
    position: absolute;
    height: 0.25rem;
    width: 100%;
  }
  &:before {
    top: 0;
    opacity: ${({ showTopShadow }) =>
      showTopShadow ? /* istanbul ignore next: Tested by Cypress */ 1 : 0};
    background: linear-gradient(
      to bottom,
      rgb(177, 186, 190) 0%,
      transparent 100%
    );
  }
  &:after {
    bottom: 0;
    opacity: ${({ showBottomShadow }) =>
      showBottomShadow ? /* istanbul ignore next: Tested by Cypress */ 1 : 0};
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgb(177, 186, 190) 100%
    );
  }
`
// const ScrollControls = styled.div`
//   display: none;
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   flex-direction: column;
//   justify-content: space-between;
//   width: 100%;
//   max-width: 35rem;
//   padding: 0.5rem 0.75rem 0.5rem 0;
//   padding-left: calc(100% - 7rem);
//   pointer-events: none;
//   & > * {
//     pointer-events: auto;
//   }
//   html[data-useragent*='Windows'] & {
//     margin-left: -17px; /* Windows Chrome scrollbar width */
//   }
//   @media (min-width: ${tabletMinWidth}px) {
//     display: flex;
//   }
//   @media (min-width: 840px) {
//     left: 50%;
//     margin-left: -420px;
//     padding-left: calc(840px - 7rem);
//     html[data-useragent*='Windows'] & {
//       margin-left: calc(-420px + -17px); /* Windows Chrome scrollbar width */
//     }
//   }
// `
const ScrollContainer = styled.div`
  flex: 1;
  overflow: auto;
`
const ScrollableContentWrapper = styled.div<{
  isScrollable: boolean
  useSideButtons: boolean
}>`
  width: 100%;
  max-width: 35rem;
  margin: 0 auto;
  padding: 0.5rem 0.5rem 1rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding-right: ${({ isScrollable, useSideButtons }) =>
      isScrollable && useSideButtons
        ? /* istanbul ignore next: Tested by Cypress */ '8rem'
        : '1rem'};
    padding-left: 1rem;
  }
`

const Contest = styled(Link)`
  color: inherit;
  text-decoration: inherit;
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  &:last-child {
    margin-bottom: 0;
  }
  box-shadow: 0 0.125rem 0.125rem 0 rgba(0, 0, 0, 0.14),
    0 0.1875rem 0.0625rem -0.125rem rgba(0, 0, 0, 0.12),
    0 0.0625rem 0.3125rem 0 rgba(0, 0, 0, 0.2);
  border-radius: 0.125rem;
  background: white;
  button& {
    cursor: pointer;
    text-align: left;
  }
  padding: 0.375rem 0.5rem;
  @media (min-width: 480px) {
    padding: 0.75rem 1rem;
  }
`
const ContestContent = styled.div`
  flex: 1;
  & h2 {
    font-size: 1rem;
    font-weight: normal;
  }
`
const ContestActions = styled.div`
  display: none;
  padding-left: 2rem;
  @media (min-width: 480px) {
    display: block;
  }
`
const ContestTitle = styled.h2``

const NoSelection = (props: { title: string }) => (
  <Text
    aria-label={`No selection was made for ${props.title}.`}
    bold
    warning
    warningIcon
    wordBreak
  >
    No selection was made for this contest.
  </Text>
)

const CandidateContestResult = ({
  contest,
  vote = [],
}: {
  contest: CandidateContest
  vote: CandidateVote
}) => {
  const remainingChoices = contest.seats - vote.length
  return vote === undefined || vote.length === 0 ? (
    <NoSelection title={contest.title} />
  ) : (
    <React.Fragment>
      {vote.map((candidate: Candidate, index: number, array: CandidateVote) => (
        <Text
          key={candidate.id}
          aria-label={`${candidate.name}${
            candidate.party ? `, ${candidate.party}` : ''
          }${candidate.isWriteIn ? `, write-in` : ''}${
            array.length - 1 === index ? '.' : ','
          }`}
          wordBreak
          voteIcon
        >
          <strong>{candidate.name}</strong>{' '}
          {candidate.party && `/ ${candidate.party}`}
          {candidate.isWriteIn && `(write-in)`}
        </Text>
      ))}
      {!!remainingChoices && (
        <Text bold warning warningIcon wordBreak>
          You may select {remainingChoices} more{' '}
          {pluralize('candidates', remainingChoices)}.
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
    <Text bold wordBreak voteIcon>
      {GLOBALS.YES_NO_VOTES[props.vote]}{' '}
      {!!props.contest.shortTitle && `on ${props.contest.shortTitle}`}
    </Text>
  ) : (
    <NoSelection title={props.contest.title} />
  )

interface State {
  isScrollAtBottom: boolean
  isScrollAtTop: boolean
  isScrollable: boolean
}

const initialState: State = {
  isScrollable: false,
  isScrollAtBottom: true,
  isScrollAtTop: true,
}

class ReviewPage extends React.Component<RouteComponentProps, State> {
  public static contextType = BallotContext
  public state: State = initialState
  private scrollContainer = React.createRef<HTMLDivElement>()
  public componentDidMount = () => {
    this.updateContestChoicesScrollStates()
    window.addEventListener('resize', this.updateContestChoicesScrollStates)
    window.addEventListener('afterprint', this.resetBallot)
    const targetElement = location.hash && document.querySelector(location.hash)
    if (targetElement) {
      targetElement.scrollIntoView({ block: 'center' })
      window.setTimeout(() => (targetElement as HTMLDivElement).focus(), 1)
    }
  }
  public componentWillUnmount = () => {
    window.removeEventListener('afterprint', this.resetBallot)
  }
  public resetBallot = () => {
    this.context.resetBallot('/cast')
  }

  public updateContestChoicesScrollStates = () => {
    const target = this.scrollContainer.current
    /* istanbul ignore next */
    if (!target) {
      return
    }
    const isTabletMinWidth = target.offsetWidth >= tabletMinWidth
    const targetMinHeight =
      GLOBALS.FONT_SIZES[this.context.userSettings.textSize] * 8 // magic number: room for buttons + spacing
    const windowsScrollTopOffsetMagicNumber = 1 // Windows Chrome is often 1px when using scroll buttons.
    const windowsScrollTop = Math.ceil(target.scrollTop) // Windows Chrome scrolls to sub-pixel values.
    this.setState({
      isScrollable:
        isTabletMinWidth &&
        /* istanbul ignore next: Tested by Cypress */
        target.scrollHeight > target.offsetHeight &&
        /* istanbul ignore next: Tested by Cypress */
        target.offsetHeight > targetMinHeight,
      isScrollAtBottom:
        windowsScrollTop +
          target.offsetHeight +
          windowsScrollTopOffsetMagicNumber >= // Windows Chrome "gte" check.
        target.scrollHeight,
      isScrollAtTop: target.scrollTop === 0,
    })
  }

  public scrollContestChoices = /* istanbul ignore next: Tested by Cypress */ (
    event: ButtonEvent
  ) => {
    const direction = (event.target as HTMLElement).dataset
      .direction as ScrollDirections
    const scrollContainer = this.scrollContainer.current!
    const currentScrollTop = scrollContainer.scrollTop
    const offsetHeight = scrollContainer.offsetHeight
    const scrollHeight = scrollContainer.scrollHeight
    const idealScrollDistance = Math.round(offsetHeight * 0.75)
    const maxScrollableDownDistance =
      scrollHeight - offsetHeight - currentScrollTop
    const maxScrollTop =
      direction === 'down'
        ? currentScrollTop + maxScrollableDownDistance
        : currentScrollTop
    const idealScrollTop =
      direction === 'down'
        ? currentScrollTop + idealScrollDistance
        : currentScrollTop - idealScrollDistance
    const top = idealScrollTop > maxScrollTop ? maxScrollTop : idealScrollTop
    scrollContainer.scrollTo({ behavior: 'smooth', left: 0, top })
  }

  public render() {
    const { bmdConfig } = this.context.election
    const { showHelpPage, showSettingsPage } = bmdConfig
    const { isScrollable, isScrollAtBottom, isScrollAtTop } = this.state

    return (
      <React.Fragment>
        <Main noOverflow noPadding>
          <ContentHeader>
            <Prose>
              <h1 className="no-print">Review Your Selections</h1>
              <Button
                data-direction="up"
                disabled={isScrollAtTop}
                fullWidth
                onClick={this.scrollContestChoices}
                tabIndex={-1}
              >
                ↑ See More
              </Button>
            </Prose>
          </ContentHeader>
          <VariableContentContainer
            showTopShadow={!isScrollAtTop}
            showBottomShadow={!isScrollAtBottom}
          >
            <ScrollContainer
              ref={this.scrollContainer}
              onScroll={this.updateContestChoicesScrollStates}
            >
              <ScrollableContentWrapper
                isScrollable={isScrollable}
                useSideButtons={false}
              >
                <BallotContext.Consumer>
                  {({ election, votes }) =>
                    election!.contests.map(contest => {
                      return (
                        <Contest
                          to={`/contests/${contest.id}#review`}
                          key={contest.id}
                          id={contest.id}
                          tabIndex={-1}
                        >
                          <ContestContent>
                            <Prose tight>
                              <ContestTitle
                                aria-label={`${contest.section}, ${
                                  contest.title
                                },`}
                              >
                                {contest.section}, {contest.title}
                              </ContestTitle>

                              {contest.type === 'candidate' && (
                                <CandidateContestResult
                                  contest={contest}
                                  vote={votes[contest.id] as CandidateVote}
                                />
                              )}
                              {contest.type === 'yesno' && (
                                <YesNoContestResult
                                  contest={contest}
                                  vote={votes[contest.id] as YesNoVote}
                                />
                              )}
                            </Prose>
                          </ContestContent>
                          <ContestActions>
                            <LinkButton
                              aria-label={`Change ${contest.title}.`}
                              className="no-print change-button"
                              preventDefault
                              to={`/contests/${contest.id}#review`}
                            >
                              Change
                            </LinkButton>
                          </ContestActions>
                        </Contest>
                      )
                    })
                  }
                </BallotContext.Consumer>
              </ScrollableContentWrapper>
            </ScrollContainer>
          </VariableContentContainer>
          <ContentFooter>
            <Button
              data-direction="down"
              disabled={isScrollAtBottom}
              fullWidth
              onClick={this.scrollContestChoices}
              tabIndex={-1}
            >
              ↓ See More
            </Button>
          </ContentFooter>
        </Main>
        <ButtonBar>
          <LinkButton to="/print" id="next">
            Next
          </LinkButton>
          <LinkButton goBack id="previous">
            Back
          </LinkButton>
          <div />
          <div />
        </ButtonBar>
        <ButtonBar
          secondary
          separatePrimaryButton
          centerOnlyChild={!showHelpPage && !showSettingsPage && false}
        >
          <div />
          {showHelpPage && <LinkButton to="/help">Help</LinkButton>}
          {showSettingsPage && <LinkButton to="/settings">Settings</LinkButton>}
        </ButtonBar>
      </React.Fragment>
    )
  }
}

export default ReviewPage
