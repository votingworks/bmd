import styled from 'styled-components'

interface Props {
  textCenter?: boolean
}

const Prose = styled('div')<Props>`
  line-height: 1.2;
  max-width: 41rem;
  padding: 1rem 0;
  text-align: ${({ textCenter }) => (textCenter ? 'center' : undefined)};
  margin: ${({ textCenter }) => (textCenter ? 'auto' : undefined)};
  & h1 {
    margin: 2rem 0 1rem;
    padding: 0 0 1rem;
  }
  & h2 {
    margin: 1.5rem 0 1rem;
  }
  & h3,
  & p {
    margin: 1rem 0;
  }
  & h1 + h2 {
    margin-top: -0.75rem;
  }
  & h1 + p,
  & h2 + p,
  & h3 + p {
    margin-top: -0.75rem;
  }
  & :first-child {
    margin-top: 0;
  }
  & :last-child {
    margin-bottom: 0;
  }
  & div {
    display: grid;
    grid-auto-rows: 1fr;
    grid-gap: 0.5rem;
    align-items: center;

    & p {
      margin: 0;
    }
  }
`

export default Prose
