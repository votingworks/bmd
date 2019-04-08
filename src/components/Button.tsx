import styled from 'styled-components'

interface Attrs extends HTMLButtonElement {
  readonly type: string
}

// @ts-ignore: 'T' triggers noUnusedParameters, but must exist for this interface to be 'generic'.
export interface ButtonInterface<T> {
  readonly danger?: boolean
  readonly primary?: boolean
}

interface Props
  extends ButtonInterface<{}>,
    React.PropsWithoutRef<JSX.IntrinsicElements['button']> {}

const Button = styled('button').attrs((attrs: Attrs) => ({
  type: attrs.type || 'button',
}))<Props>`
  box-sizing: border-box;
  cursor: pointer;
  background: ${({ danger = false, primary = false }) =>
    (danger && 'red') || (primary && 'rgb(71, 167, 75)') || 'lightgrey'};
  border: none;
  border-radius: 0.25rem;
  padding: 0.4rem 0.7rem;
  color: ${({ disabled = false, danger = false, primary = false }) =>
    (disabled && 'darkgrey') ||
    (danger && 'white') ||
    (primary && 'white') ||
    'black'};
  line-height: 1;
  white-space: nowrap;
`

export default Button
