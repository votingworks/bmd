export interface PrintedBallotPageLayout {
  readonly bounds: Rect
  readonly contests: readonly PrintedBallotContestLayout[]
}

export interface PrintedBallotContestLayout {
  readonly bounds: Rect
  readonly title: string
  readonly candidates: readonly PrintedBallotCandidateLayout[]
  readonly writeIns: readonly PrintedBallotWriteInLayout[]
}

export interface PrintedBallotCandidateLayout {
  readonly bounds: Rect
  readonly name: string
  readonly mark: Rect
}

export interface PrintedBallotWriteInLayout {
  readonly bounds: Rect
  readonly mark: Rect
  readonly textarea: Rect
}

export interface Rect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export interface Offset {
  readonly offsetLeft: number
  readonly offsetTop: number
}

export default function getPrintedBallotPageLayout(
  $ballot: HTMLElement
): PrintedBallotPageLayout {
  const ballotOffset = getBodyOffset($ballot)

  return {
    bounds: getElementBounds($ballot, ballotOffset),
    contests: $$('*[data-contest]', $ballot).map(contest =>
      getPrintedBallotContestLayout(contest, ballotOffset)
    ),
  }
}

export function getPrintedBallotContestLayout(
  $contest: HTMLElement,
  ballotOffset: Offset
): PrintedBallotContestLayout {
  const title = $contest.getAttribute('data-contest-title') ?? ''

  return {
    bounds: getElementBounds($contest, ballotOffset),
    title,
    candidates: $$('*[data-candidate]', $contest).map($candidate =>
      getPrintedBallotCandidateLayout($candidate, ballotOffset)
    ),
    writeIns: $$('*[data-write-in]', $contest).map($writeIn =>
      getPrintedBallotWriteInLayout($writeIn, ballotOffset)
    ),
  }
}

export function getPrintedBallotCandidateLayout(
  $candidate: HTMLElement,
  ballotOffset: Offset
): PrintedBallotCandidateLayout {
  const $mark = $('*[data-mark]', $candidate)
  const candidateName = $('*[data-candidate-name]', $candidate).getAttribute(
    'data-candidate-name'
  )!

  return {
    bounds: getElementBounds($candidate, ballotOffset),
    mark: getElementBounds($mark, ballotOffset),
    name: candidateName,
  }
}

export function getPrintedBallotWriteInLayout(
  $writeIn: HTMLElement,
  ballotOffset: Offset
): PrintedBallotWriteInLayout {
  const $mark = $('*[data-mark]', $writeIn)
  const $writeInLine = $('*[data-write-in-line]', $writeIn)

  return {
    bounds: getElementBounds($writeIn, ballotOffset),
    mark: getElementBounds($mark, ballotOffset),
    textarea: getElementBounds($writeInLine, ballotOffset),
  }
}

function $(
  selector: string,
  root: HTMLElement = document.documentElement
): HTMLElement {
  const result = root.querySelector<HTMLElement>(selector)

  if (!result) {
    throw new Error(`query returned no element: ${selector}`)
  }

  return result
}

function $$(
  selector: string,
  root: HTMLElement = document.documentElement
): readonly HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)]
}

function getBodyOffset(element: HTMLElement): Offset {
  const { offsetLeft, offsetTop, offsetParent } = element

  if (offsetParent === document.body) {
    return {
      offsetLeft,
      offsetTop,
    }
  }

  if (!offsetParent || !(offsetParent instanceof HTMLElement)) {
    throw new Error('element has no offsetParent')
  }

  const parentOffset = getBodyOffset(offsetParent)

  return {
    offsetLeft: offsetLeft + parentOffset.offsetLeft,
    offsetTop: offsetTop + parentOffset.offsetTop,
  }
}

function getElementBounds(
  element: HTMLElement,
  baseOffset: Offset = { offsetLeft: 0, offsetTop: 0 }
): Rect {
  const { offsetLeft, offsetTop } = getBodyOffset(element)

  return {
    left: offsetLeft - baseOffset.offsetLeft,
    top: offsetTop - baseOffset.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  }
}
