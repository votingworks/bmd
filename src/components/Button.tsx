import styled from 'styled-components'

interface Attrs extends HTMLButtonElement {
  readonly type: string
}

export interface ButtonInterface<T> {
  readonly danger?: boolean
  readonly inTableMargins?: boolean
  readonly primary?: boolean
}

interface Props
  extends React.PropsWithoutRef<JSX.IntrinsicElements['button']> {}
interface Props extends ButtonInterface<{}> {}

const Button = styled('button').attrs((props: Attrs) => ({
  type: props.type || 'button',
}))`
  box-sizing: border-box;
  cursor: pointer;
  margin: ${({ inTableMargins }: Props) =>
    inTableMargins ? '-0.5rem 0' : undefined};
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
