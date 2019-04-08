import camelCase from 'lodash.camelcase'
import React from 'react'
import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import styled from 'styled-components'

import {
  ButtonEvent, // eslint-disable-line import/named
  Candidate,
  CandidateContest as CandidateContestInterface,
  CandidateVote, // eslint-disable-line import/named
  InputEvent, // eslint-disable-line import/named
  OptionalCandidate, // eslint-disable-line import/named
  ScrollDirections, // eslint-disable-line import/named
  UpdateVoteFunction, // eslint-disable-line import/named
} from '../config/types'

import BallotContext from '../contexts/ballotContext'

import GLOBALS from '../config/globals'
import Button from './Button'
import Modal from './Modal'
import Prose from './Prose'
import Text from './Text'

const tabletMinWidth = 720

const ContestSection = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
`
const ContestMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`
const ContestHeader = styled.div`
  width: 100%;
  max-width: 35rem;
  margin: 0px auto;
  padding: 1rem 0.75rem 0.5rem;
  @media (min-width: 640px) {
    padding: 1rem 1.5rem 0.5rem;
    padding-left: 5rem;
  }
`
const ChoicesWrapper = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  overflow: auto;
`
const ScrollControls = styled.div`
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  flex-direction: column;
  justify-content: space-between;
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
const Choices = styled.div<{
  showTopShadow?: boolean
}>`
  flex: 1;
  overflow: auto;
  &:before {
    content: '';
    z-index: 1;
    transition: opacity 0.25s ease;
    height: 5px;
    width: 100%;
    position: fixed;
    opacity: ${({ showTopShadow }) =>
      showTopShadow ? /* istanbul ignore next: Tested by Cypress */ 1 : 0};
    background: linear-gradient(
      to bottom,
      rgb(177, 186, 190) 0%,
      transparent 100%
    );
  }
`
const ChoicesGrid = styled.div<{ isScrollable: boolean }>`
  display: grid;
  grid-auto-rows: minmax(auto, 1fr);
  grid-gap: 0.75rem;
  width: 100%;
  max-width: 35rem;
  margin: 0 auto;
  padding: 0.5rem 0.5rem 2rem;
  @media (min-width: ${tabletMinWidth}px) {
    padding-right: ${({ isScrollable }) =>
      isScrollable
        ? /* istanbul ignore next: Tested by Cypress */ '8rem'
        : '1rem'};
    padding-left: 1rem;
  }
`
const Choice = styled('label')<{ isSelected: boolean }>`
  cursor: pointer;
  position: relative;
  display: grid;
  align-items: center;
  border-radius: 0.125rem;
  background: ${({ isSelected }) => (isSelected ? '#028099' : 'white')};
  color: ${({ isSelected }) => (isSelected ? 'white' : undefined)};
  box-shadow: 0 0.125rem 0.125rem 0 rgba(0, 0, 0, 0.14),
    0 0.1875rem 0.0625rem -0.125rem rgba(0, 0, 0, 0.12),
    0 0.0625rem 0.3125rem 0 rgba(0, 0, 0, 0.2);
  transition: background 0.25s, color 0.25s;
  button& {
    text-align: left;
  }
  :focus-within {
    outline: -webkit-focus-ring-color auto 5px;
  }
  :before {
    content: '${({ isSelected }) => (isSelected ? '✓' : '')}';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: white;
    border-right: 1px solid;
    border-color: ${({ isSelected }) => (isSelected ? '#028099' : 'lightgrey')};
    width: 3rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    border-radius: 0.125rem 0 0 0.125rem;
    color: #028099;
  }
  & > div {
    word-break: break-word;
    padding: 0.5rem 0.5rem 0.5rem 4rem;
    @media (min-width: 480px) {
      padding: 1rem 1rem 1rem inherit;
    }
  }
`
const ChoiceInput = styled.input.attrs({
  type: 'checkbox',
})`
  margin-right: 0.5rem;
`

const WriteInCandidateForm = styled.div`
  background-color: lightgrey;
  margin: 1rem 0 -1rem;
  border-radius: 0.25rem;
  padding: 0.25rem;
`

const WriteInCandidateFieldSet = styled.fieldset`
  margin: 0.5rem 0.5rem 1rem;
`

const WriteInCandidateInput = styled.input.attrs({
  readOnly: true,
  type: 'text',
})`
  width: 100%;
  outline: none;
  box-shadow: 0 0 3px -1px rgba(0, 0, 0, 0.3);
  border: 1px solid darkgrey;
  padding: 0.25rem 0.35rem;
`

interface Props {
  contest: CandidateContestInterface
  vote: CandidateVote
  updateVote: UpdateVoteFunction
}

interface State {
  attemptedOverVoteCandidate: OptionalCandidate
  candidatePendingRemoval: OptionalCandidate
  isScrollAtBottom: boolean
  isScrollAtTop: boolean
  isScrollable: boolean
  writeInCandateModalIsOpen: boolean
  writeInCandidateName: string
}

const initialState = {
  attemptedOverVoteCandidate: undefined,
  candidatePendingRemoval: undefined,
  isScrollAtBottom: false,
  isScrollAtTop: true,
  isScrollable: false,
  writeInCandateModalIsOpen: false,
  writeInCandidateName: '',
}

class CandidateContest extends React.Component<Props, State> {
  public static contextType = BallotContext
  private keyboard = React.createRef<Keyboard>()
  private contestChoices = React.createRef<HTMLDivElement>()
  public state: State = initialState

  public componentDidMount() {
    this.updateContestChoicesScrollStates()
    window.addEventListener('resize', this.updateContestChoicesScrollStates)
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.vote.length !== prevProps.vote.length) {
      this.updateContestChoicesScrollStates()
    }
  }

  public componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateContestChoicesScrollStates)
  }

  public findCandidateById = (candidates: Candidate[], id: string) =>
    candidates.find(c => c.id === id)

  public addCandidateToVote = (id: string) => {
    const { contest, vote } = this.props
    const { candidates } = contest
    const candidate = this.findCandidateById(candidates, id)!
    this.props.updateVote(contest.id, [...vote, candidate])
  }

  public removeCandidateFromVote = (id: string) => {
    const { contest, vote } = this.props
    const newVote = vote.filter(c => c.id !== id)
    this.props.updateVote(contest.id, newVote)
  }

  public handleUpdateSelection = (event: InputEvent) => {
    const { vote } = this.props
    const id = (event.target as HTMLInputElement).value
    const candidate = this.findCandidateById(vote, id)
    if (candidate) {
      if (candidate.isWriteIn) {
        this.setState({ candidatePendingRemoval: candidate })
      } else {
        this.removeCandidateFromVote(id)
      }
    } else {
      this.addCandidateToVote(id)
    }
  }

  public handleChangeVoteAlert = (
    attemptedOverVoteCandidate: OptionalCandidate
  ) => {
    this.setState({ attemptedOverVoteCandidate })
  }

  public closeAttemptedVoteAlert = () => {
    this.setState({ attemptedOverVoteCandidate: undefined })
  }

  public confirmRemovePendingWriteInCandidate = () => {
    this.removeCandidateFromVote(this.state.candidatePendingRemoval!.id)
    this.clearCandidateIdPendingRemoval()
  }

  public clearCandidateIdPendingRemoval = () => {
    this.setState({ candidatePendingRemoval: undefined })
  }

  public initWriteInCandidate = () => {
    this.toggleWriteInCandidateModal(true)
  }

  public normalizeName = (name: string) =>
    name
      .trim()
      .replace(/\t+/g, ' ')
      .replace(/\s+/g, ' ')

  public addWriteInCandidate = () => {
    const { contest, vote } = this.props
    const normalizedCandidateName = this.normalizeName(
      this.state.writeInCandidateName
    )
    this.props.updateVote(contest.id, [
      ...vote,
      {
        id: `write-in__${camelCase(normalizedCandidateName)}`,
        isWriteIn: true,
        name: normalizedCandidateName,
      },
    ])
    this.setState({ writeInCandidateName: '' })
    this.toggleWriteInCandidateModal(false)
  }

  public cancelWriteInCandidateModal = () => {
    this.setState({ writeInCandidateName: '' })
    this.toggleWriteInCandidateModal(false)
  }

  public toggleWriteInCandidateModal = (writeInCandateModalIsOpen: boolean) => {
    this.setState({ writeInCandateModalIsOpen })
  }

  public onKeyboardInputChange = (writeInCandidateName: string) => {
    this.setState({ writeInCandidateName })
  }

  public updateContestChoicesScrollStates = () => {
    const target = this.contestChoices.current!
    const isTabletMinWidth = target.offsetWidth >= tabletMinWidth
    const targetMinHeight =
      GLOBALS.FONT_SIZES[this.context.userSettings.textSize] * 8 // magic number: room for buttons + spacing
    const windowsScrollTopOffsetMagicNumber = 1 // Windows Chrome is often 1px when using scroll buttons.
    const windowsScrollTop = Math.ceil(target.scrollTop) // Windows Chrome scrolls to sub-pixel values.
    this.setState({
      isScrollAtBottom:
        windowsScrollTop +
          target.offsetHeight +
          windowsScrollTopOffsetMagicNumber >= // Windows Chrome "gte" check.
        target.scrollHeight,
      isScrollAtTop: target.scrollTop === 0,
      isScrollable:
        isTabletMinWidth &&
        /* istanbul ignore next: Tested by Cypress */
        target.scrollHeight > target.offsetHeight &&
        /* istanbul ignore next: Tested by Cypress */
        target.offsetHeight > targetMinHeight,
    })
  }

  public scrollContestChoices = /* istanbul ignore next: Tested by Cypress */ (
    event: ButtonEvent
  ) => {
    const direction = (event.target as HTMLElement).dataset
      .direction as ScrollDirections
    const contestChoices = this.contestChoices.current!
    const currentScrollTop = contestChoices.scrollTop
    const offsetHeight = contestChoices.offsetHeight
    const scrollHeight = contestChoices.scrollHeight
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
    contestChoices.scrollTo({ behavior: 'smooth', left: 0, top })
  }

  public render() {
    const { contest, vote } = this.props
    const hasReachedMaxSelections = contest.seats === vote.length
    const {
      attemptedOverVoteCandidate,
      candidatePendingRemoval,
      isScrollable,
      isScrollAtBottom,
      isScrollAtTop,
      writeInCandidateName,
      writeInCandateModalIsOpen,
    } = this.state
    const maxWriteInCandidateLength = 40
    return (
      <React.Fragment>
        <ContestMain>
          <ContestHeader id="contest-header">
            <Prose>
              <h1 aria-label={`${contest.section}, ${contest.title}.`}>
                <ContestSection>{contest.section}</ContestSection>
                {contest.title}
              </h1>
              <p>
                <strong>Vote for {contest.seats}.</strong> You have selected{' '}
                {vote.length}.
              </p>
            </Prose>
          </ContestHeader>
          <ChoicesWrapper>
            <Choices
              ref={this.contestChoices}
              onScroll={this.updateContestChoicesScrollStates}
              showTopShadow={!isScrollAtTop}
            >
              <ChoicesGrid
                isScrollable={isScrollable}
                role="group"
                aria-labelledby="contest-header"
              >
                {contest.candidates.map(candidate => {
                  const isChecked = !!this.findCandidateById(vote, candidate.id)
                  const isDisabled = hasReachedMaxSelections && !isChecked
                  const handleDisabledClick = () => {
                    if (isDisabled) {
                      this.handleChangeVoteAlert(candidate)
                    }
                  }
                  return (
                    <Choice
                      key={candidate.id}
                      htmlFor={candidate.id}
                      isSelected={isChecked}
                      onClick={handleDisabledClick}
                    >
                      <ChoiceInput
                        id={candidate.id}
                        name={candidate.name}
                        value={candidate.id}
                        onChange={this.handleUpdateSelection}
                        checked={isChecked}
                        disabled={isDisabled}
                        className="visually-hidden"
                      />
                      <Prose>
                        <p
                          aria-label={`${candidate.name}, ${candidate.party}.`}
                        >
                          <strong>{candidate.name}</strong>
                          <br />
                          {candidate.party}
                        </p>
                      </Prose>
                    </Choice>
                  )
                })}
                {contest.allowWriteIns &&
                  vote
                    .filter(c => c.isWriteIn)
                    .map(candidate => {
                      return (
                        <Choice
                          key={candidate.id}
                          htmlFor={candidate.id}
                          isSelected
                        >
                          <ChoiceInput
                            id={candidate.id}
                            name={contest.id}
                            value={candidate.id}
                            onChange={this.handleUpdateSelection}
                            checked
                            className="visually-hidden"
                          />
                          <Prose>
                            <p aria-label={`${candidate.name}.`}>
                              <strong>{candidate.name}</strong>
                            </p>
                          </Prose>
                        </Choice>
                      )
                    })}
                {contest.allowWriteIns && !hasReachedMaxSelections && (
                  <Choice
                    as="button"
                    isSelected={false}
                    onClick={this.initWriteInCandidate}
                  >
                    <Prose>
                      <p aria-label={`add write-in candidate.`}>
                        <em>add write-in candidate</em>
                      </p>
                    </Prose>
                  </Choice>
                )}
              </ChoicesGrid>
            </Choices>
            {isScrollable /* istanbul ignore next: Tested by Cypress */ && (
              <ScrollControls aria-hidden="true">
                <Button
                  data-direction="up"
                  disabled={isScrollAtTop}
                  onClick={this.scrollContestChoices}
                  tabIndex={-1}
                >
                  ↑ See More
                </Button>
                <Button
                  data-direction="down"
                  disabled={isScrollAtBottom}
                  onClick={this.scrollContestChoices}
                  tabIndex={-1}
                >
                  ↓ See More
                </Button>
              </ScrollControls>
            )}
          </ChoicesWrapper>
        </ContestMain>
        <Modal
          isOpen={!!attemptedOverVoteCandidate}
          content={
            <Prose>
              <Text>
                You may only select {contest.seats}{' '}
                {contest.seats === 1 ? 'candidate' : 'candidates'} in this
                contest. To vote for{' '}
                {attemptedOverVoteCandidate && attemptedOverVoteCandidate.name},
                you must first unselect selected{' '}
                {contest.seats === 1 ? 'candidate' : 'candidates'}.
              </Text>
            </Prose>
          }
          actions={
            <Button primary autoFocus onClick={this.closeAttemptedVoteAlert}>
              Okay
            </Button>
          }
        />
        <Modal
          isOpen={!!candidatePendingRemoval}
          content={
            <Prose>
              <Text>
                Are you sure you want to unselect and remove{' '}
                {candidatePendingRemoval && candidatePendingRemoval.name}?
              </Text>
            </Prose>
          }
          actions={
            <>
              <Button
                danger
                onClick={this.confirmRemovePendingWriteInCandidate}
              >
                Yes, Remove.
              </Button>
              <Button onClick={this.clearCandidateIdPendingRemoval}>
                Cancel
              </Button>
            </>
          }
        />
        <Modal
          isOpen={writeInCandateModalIsOpen}
          content={
            <div>
              <Prose>
                <h2>Write-In Candidate</h2>
                <Text>
                  Enter the name of a person who is <strong>not</strong> on the
                  ballot using the on-screen keyboard.
                </Text>
                {writeInCandidateName.length > 35 && (
                  <Text error>
                    <strong>Note:</strong> You have entered{' '}
                    {writeInCandidateName.length} of maximum{' '}
                    {maxWriteInCandidateLength} characters.
                  </Text>
                )}
              </Prose>
              <WriteInCandidateForm>
                <WriteInCandidateFieldSet>
                  <legend>
                    <label htmlFor="WriteInCandidateName">
                      <Prose>
                        <Text bold small>
                          {contest.title} (write-in)
                        </Text>
                      </Prose>
                    </label>
                  </legend>
                  <WriteInCandidateInput
                    id="WriteInCandidateName"
                    value={writeInCandidateName}
                    placeholder="candidate name"
                  />
                </WriteInCandidateFieldSet>
                <Keyboard
                  ref={this.keyboard}
                  layout={{
                    default: [
                      'Q W E R T Y U I O P',
                      'A S D F G H J K L -',
                      'Z X C V B N M , .',
                      '{space} {bksp}',
                    ],
                  }}
                  display={{ '{bksp}': '⌫ delete', '{space}': 'space' }}
                  mergeDisplay
                  disableCaretPositioning
                  maxLength={maxWriteInCandidateLength}
                  layoutName="default"
                  theme={'hg-theme-default vs-simple-keyboard'}
                  onChange={this.onKeyboardInputChange}
                  useButtonTag
                />
              </WriteInCandidateForm>
            </div>
          }
          actions={
            <>
              <Button
                primary={this.normalizeName(writeInCandidateName).length > 0}
                onClick={this.addWriteInCandidate}
                disabled={this.normalizeName(writeInCandidateName).length === 0}
              >
                Accept
              </Button>
              <Button onClick={this.cancelWriteInCandidateModal}>Cancel</Button>
            </>
          }
        />
      </React.Fragment>
    )
  }
}

export default CandidateContest
