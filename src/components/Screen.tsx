import React from 'react'
import styled from 'styled-components'

const ScreenStyle = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

class Screen extends React.Component {
  public componentDidMount() {
    document.getElementById('root')!.click()
  }

  public render() {
    return <ScreenStyle>{this.props.children}</ScreenStyle>
  }
}

export default Screen
