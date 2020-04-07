import React from 'react'
import styled from 'styled-components'

interface Props {
  label?: string
}

const Container = styled.span`
  display: block;
  flex: 1;
  border-bottom: 0.1rem solid #000000;
`

const WriteInLine = ({ label }: Props) => <Container>{label}</Container>

export default WriteInLine
