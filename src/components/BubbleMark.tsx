import React from 'react'
import styled from 'styled-components'

interface StyledProps {
  checked?: boolean
}

interface Props extends StyledProps {
  children?: React.ReactNode
}

export const Bubble = styled.span<StyledProps>`
  display: inline-block;
  border: 2px solid #000000;
  border-radius: 100%;
  background: ${({ checked }) => (checked ? '#000000' : undefined)};
  width: 1.5rem;
  height: 1rem;
  vertical-align: bottom;
`

const Container = styled.span`
  display: flex;
  align-items: flex-start;
  & > span:first-child {
    margin-top: 0.15rem;
    margin-right: 0.3rem;
  }
`

const Content = styled.span`
  display: flex;
  flex: 1;
  flex-direction: row;
`

export const BubbleMark = ({ checked = false, children }: Props) => (
  <Container>
    <Bubble checked={checked} />
    <Content>{children}</Content>
  </Container>
)

// export default BubbleMark