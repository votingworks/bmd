import React from 'react'
import styled from 'styled-components'

interface Props {
  seal: string
  sealURL: string
}

const SealImage = styled.img`
  max-width: 1in;
`

const Seal = ({ seal, sealURL }: Props) => {
  return (
    <React.Fragment>
      {seal ? (
        <div
          className="seal"
          // TODO: Sanitize the SVG content: https://github.com/votingworks/bmd/issues/99
          dangerouslySetInnerHTML={{ __html: seal }} // eslint-disable-line react/no-danger
        />
      ) : sealURL ? (
        <div className="seal">
          <SealImage src={sealURL} alt="" />
        </div>
      ) : (
        <React.Fragment />
      )}
    </React.Fragment>
  )
}

export default Seal
