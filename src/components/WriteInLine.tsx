import React from 'react'
import styled from 'styled-components'

interface Props {
  label?: string
}

const Container = styled.span`
  display: block;
  flex: 1;
  border-bottom: 1pt solid #000000;
`

const WriteInLine = ({ label }: Props) => (
  <Container data-write-in-line>{label}</Container>
)

export default WriteInLine
