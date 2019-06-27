import styled from 'styled-components'

interface Props {
  noPadding?: boolean
  noOverflow?: boolean
}

const Main = styled('main')<Props>`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: ${({ noOverflow = false }) => (noOverflow ? undefined : 'auto')};
  padding: ${({ noPadding = false }) =>
    noPadding ? undefined : '1rem 0.5rem 2rem'};
  @media (min-width: 480px) {
    padding: ${({ noPadding = false }) =>
      noPadding ? undefined : '2rem 1rem'};
  }
  @media print {
    justify-content: flex-start;
    padding: 0;
  }
  ::-webkit-scrollbar {
    display: none;
  }    
`

interface ChildProps {
  center?: boolean
  centerVertical?: boolean
  centerHorizontal?: boolean
  padded?: boolean
}

export const MainChild = styled('div')<ChildProps>`
  margin: ${({
    center = false,
    centerVertical = center,
    centerHorizontal = center,
  }) => `${centerVertical ? 'auto' : '0'} ${centerHorizontal ? 'auto' : '0'}`};
  width: 100%;
  max-width: 35rem;
  padding: ${({ padded = false }) => (padded ? '1rem' : undefined)};
  @media print {
    margin: 0;
    max-width: 100%;
  }
  `

export default Main
