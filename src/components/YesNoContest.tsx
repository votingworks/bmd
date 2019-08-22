import React, { PointerEventHandler } from 'react'
import styled from 'styled-components'

import {
  InputEvent,
  OptionalYesNoVote,
  Scrollable,
  ScrollDirections,
  ScrollShadows,
  UpdateVoteFunction,
  YesNoContest as YesNoContestInterface,
  YesNoVote,
} from '../config/types'

import BallotContext from '../contexts/ballotContext'

import * as GLOBALS from '../config/globals'
import ChoiceButton from './ChoiceButton'
import Button from './Button'
import Main from './Main'
import Modal from './Modal'
import Prose from './Prose'
import Text, { TextWithLineBreaks } from './Text'

const tabletMinWidth = 720
const votes = GLOBALS.YES_NO_VOTES

const ContentHeader = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 35rem;
  padding: 1rem 0.75rem 0.5rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding: 1rem 1.5rem 0.5rem;
    padding-left: 5rem;
  }
`
const ContestSection = styled.div`
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
`
const ContestDescription = styled.div`
  padding: 0 0.25rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding-left: 4rem;
  }
`
const ContestFooter = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 35rem;
  padding: 1rem 0.5rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding-right: 1rem;
    padding-left: 1rem;
  }
`
const VariableContentContainer = styled.div<ScrollShadows>`
  display: flex;
  flex: 1;
  position: relative;
  overflow: auto;
  &::before,
  &::after {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 0.25rem;
    content: '';
    transition: opacity 0.25s ease;
  }
  &::before {
    top: 0;
    opacity: ${({ showTopShadow }) =>
      showTopShadow ? /* istanbul ignore next: Tested by Cypress */ 1 : 0};
    background: linear-gradient(
      to bottom,
      rgb(177, 186, 190) 0%,
      transparent 100%
    );
  }
  &::after {
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
const ScrollControls = styled.div`
  display: none;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 35rem;
  padding: 0.5rem 0.75rem 0.5rem 0;
  padding-left: calc(100% - 7rem);
  pointer-events: none;
  & > * {
    pointer-events: auto;
  }
  html[data-useragent*='Windows'] & {
    margin-left: -17px; /* Windows Chrome scrollbar width */
  }
  @media (min-width: ${tabletMinWidth}px) {
    display: flex;
  }
  @media (min-width: 840px) {
    left: 50%;
    margin-left: -420px;
    padding-left: calc(840px - 7rem);
    html[data-useragent*='Windows'] & {
      margin-left: calc(-420px + -17px); /* Windows Chrome scrollbar width */
    }
  }
`
const ScrollContainer = styled.div`
  flex: 1;
  overflow: auto;
`
const ScrollableContentWrapper = styled.div<Scrollable>`
  margin: 0 auto;
  width: 100%;
  max-width: 35rem;
  padding: 0.5rem 0.5rem 1rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding-right: ${({ isScrollable }) =>
      isScrollable
        ? /* istanbul ignore next: Tested by Cypress */ '8rem'
        : '1rem'};
    padding-left: 1rem;
  }
`
const ChoicesGrid = styled.div`
  display: grid;
  grid-auto-rows: minmax(auto, 1fr);
  grid-gap: 1.25rem;
`

interface Props {
  contest: YesNoContestInterface
  vote: OptionalYesNoVote
  updateVote: UpdateVoteFunction
}

interface State {
  isScrollable: boolean
  isScrollAtBottom: boolean
  isScrollAtTop: boolean
  overvoteSelection: OptionalYesNoVote
}

const initialState: State = {
  isScrollable: false,
  isScrollAtBottom: true,
  isScrollAtTop: true,
  overvoteSelection: undefined,
}

export default class YesNoContest extends React.Component<Props> {
  public static contextType = BallotContext
  public context!: React.ContextType<typeof BallotContext>
  public state = initialState
  private scrollContainer = React.createRef<HTMLDivElement>()

  public componentDidMount() {
    this.updateContestChoicesScrollStates()
    window.addEventListener('resize', this.updateContestChoicesScrollStates)
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.vote !== prevProps.vote) {
      this.updateContestChoicesScrollStates()
    }
  }

  public handleUpdateSelection = (event: InputEvent) => {
    const { vote } = this.props
    const newVote = (event.currentTarget as HTMLInputElement).dataset
      .vote as YesNoVote
    if (vote === newVote) {
      this.props.updateVote(this.props.contest.id, undefined)
    } else {
      this.props.updateVote(this.props.contest.id, newVote)
    }
  }

  public handleChangeVoteAlert = (overvoteSelection: YesNoVote) => {
    this.setState({ overvoteSelection })
  }

  public updateContestChoicesScrollStates = () => {
    const target = this.scrollContainer.current
    /* istanbul ignore next - `target` should aways exist, but sometimes it doesn't. Don't know how to create this condition in testing.  */
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

  public scrollContestChoices: PointerEventHandler = /* istanbul ignore next: Tested by Cypress */ event => {
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
    scrollContainer.scrollTo({
      behavior: 'smooth',
      left: 0,
      top,
    })
  }

  public closeOvervoteAlert = () => {
    // Delay to avoid passing tap to next screen
    window.setTimeout(() => {
      this.setState({ overvoteSelection: initialState.overvoteSelection })
    }, 200)
  }

  public render() {
    const { contest, vote } = this.props
    const { overvoteSelection } = this.state
    const { isScrollable, isScrollAtBottom, isScrollAtTop } = this.state
    return (
      <React.Fragment>
        <Main noPadding>
          <ContentHeader id="contest-header">
            <Prose id="audiofocus">
              <h1 aria-label={`${contest.title}.`}>
                <ContestSection>{contest.section}</ContestSection>
                {contest.title}
              </h1>
              <p aria-label="Vote Yes or No. Use the down arrow to select your preference. Use the right arrow to move to the next contest.">
                <strong>Vote Yes or No.</strong>
              </p>
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
              <ScrollableContentWrapper isScrollable={isScrollable}>
                <ContestDescription>
                  <Prose>
                    <TextWithLineBreaks text={contest.description} />
                  </Prose>
                </ContestDescription>
              </ScrollableContentWrapper>
            </ScrollContainer>
            {isScrollable /* istanbul ignore next: Tested by Cypress */ && (
              <ScrollControls aria-hidden="true">
                <Button
                  data-direction="up"
                  disabled={isScrollAtTop}
                  onPress={this.scrollContestChoices}
                >
                  ↑ See More
                </Button>
                <Button
                  data-direction="down"
                  disabled={isScrollAtBottom}
                  onPress={this.scrollContestChoices}
                >
                  ↓ See More
                </Button>
              </ScrollControls>
            )}
          </VariableContentContainer>
          <ContestFooter>
            <ChoicesGrid data-testid="contest-choices">
              {['Yes', 'No'].map(answer => {
                const answerLowerCase = answer.toLowerCase()
                const isChecked = vote === answerLowerCase
                const isDisabled = !isChecked && !!vote
                const handleDisabledClick = () => {
                  this.handleChangeVoteAlert(answer.toLowerCase() as YesNoVote)
                }
                return (
                  <ChoiceButton
                    key={answer}
                    data-vote={answerLowerCase}
                    isSelected={isChecked}
                    onPress={
                      isDisabled
                        ? handleDisabledClick
                        : this.handleUpdateSelection
                    }
                  >
                    <Prose>
                      <Text
                        aria-label={`${answer} on ${contest.shortTitle ||
                          contest.title}`}
                        wordBreak
                      >
                        {answer}
                      </Text>
                    </Prose>
                  </ChoiceButton>
                )
              })}
            </ChoicesGrid>
          </ContestFooter>
        </Main>
        <Modal
          isOpen={!!overvoteSelection}
          content={
            <Prose>
              {overvoteSelection && (
                <p>
                  Do you want to change your vote to{' '}
                  <strong>{votes[overvoteSelection]}</strong>? To change your
                  vote, first unselect your vote for{' '}
                  <strong>
                    {
                      {
                        no: votes.yes,
                        yes: votes.no,
                      }[overvoteSelection]
                    }
                  </strong>
                  .
                </p>
              )}
            </Prose>
          }
          actions={
            <Button primary autoFocus onPress={this.closeOvervoteAlert}>
              Okay
            </Button>
          }
        />
      </React.Fragment>
    )
  }
}
