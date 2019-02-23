import styled from 'styled-components'

interface Attrs extends HTMLButtonElement {
  readonly type: string
}

interface Props {
  readonly danger?: boolean
  readonly disabled?: boolean
  readonly primary?: boolean
}

const Button = styled('button').attrs((props: Attrs) => ({
  type: props.type || 'button',
}))`
  box-sizing: border-box;
  cursor: pointer;
  background: ${({ danger = false, primary = false }: Props) =>
    (danger && 'red') || (primary && '#4caf50') || 'lightgrey'};
  border: none;
  border-radius: 0.25rem;
  padding: 0.4rem 0.7rem;
  color: ${({ disabled = false, danger = false, primary = false }: Props) =>
    (disabled && 'darkgrey') ||
    (danger && 'white') ||
    (primary && 'white') ||
    'black'};
  line-height: 1;
  white-space: nowrap;
`

export default Button
