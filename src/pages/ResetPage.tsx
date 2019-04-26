import React, { useContext } from 'react'

import BallotContext from '../contexts/ballotContext'

const ResetPage = () => {
  const { resetBallot } = useContext(BallotContext)
  resetBallot()

  return <></>
}

export default ResetPage
