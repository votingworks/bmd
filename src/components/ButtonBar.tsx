import styled from 'styled-components'

interface Props {
  dark?: boolean
  secondary?: boolean
  separatePrimaryButton?: boolean
  centerOnlyChild?: boolean
}

const ButtonBar = styled('nav')<Props>`
  order: ${({ secondary }) => (secondary ? '-1' : undefined)};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: ${({ secondary }) =>
    secondary ? 'repeat(4, 1fr)' : undefined};
  grid-auto-rows: 2.5rem;
  grid-gap: 1rem;
  padding: 1rem;
  background: ${({ dark = true }) =>
    dark ? '#455a64' : 'rgba(0, 0, 0, 0.05)'};
  border-bottom: 1px solid darkgrey;
  justify-content: space-between;
  align-items: center;

  & > * {
    flex: 1;
    @media (min-width: 480px) {
      flex: ${({ separatePrimaryButton }) =>
        separatePrimaryButton ? '0' : undefined};
    }
  }
  & > *:only-child {
    @media (min-width: 480px) {
      margin: ${({ centerOnlyChild = true }) =>
        centerOnlyChild ? 'auto' : undefined};
      max-width: 30%;
    }
  }
  @media print {
    display: none;
  }
`

export default ButtonBar
