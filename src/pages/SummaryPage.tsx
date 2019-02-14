import React, { useContext, useState } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'

import Button from '../components/Button'
import ButtonBar from '../components/ButtonBar'
import Main from '../components/Main'
import Modal from '../components/Modal'
import { Text } from '../components/Typography'
import BallotContext from '../contexts/ballotContext'

const Header = styled.div`
  margin: 1rem 0;
`

const Table = styled.table`
  width: 100%;
  max-width: 66ch;
  text-align: left;
  border-bottom: 1px solid lightGrey;
`
interface TableCellProps {
  border?: boolean
}
const TableCell = styled.td`
  width: 50%;
  padding: 0.5rem 0.25rem;
  border-top: ${({ border = false }: TableCellProps) =>
    border ? '1px solid lightGrey' : 'none'};
`

const SummaryPage = (props: RouteComponentProps) => {
  const { contests, resetBallot, votes } = useContext(BallotContext)
  const [isAlert, setAlert] = useState(false)
  const closeAlert = () => {
    setAlert(false)
  }
  const requestNewBallot = () => {
    Object.keys(votes).length === 0 ? startOver() : setAlert(true)
  }
  const startOver = () => {
    resetBallot()
    props.history.push('/')
  }
  return (
    <React.Fragment>
      <Main>
        <Header className="prose">
          <h1>Official Ballot</h1>
          <p className="no-print">
            Please review your ballot. Confirm your votes by selecting the
            “Print Ballot” button.
          </p>
        </Header>
        <Table>
          <caption className="no-print visually-hidden">
            <p>Summary of your votes.</p>
          </caption>
          <thead className="no-print">
            <tr>
              <TableCell as="th" scope="col">
                Contest
              </TableCell>
              <TableCell as="th" scope="col">
                Vote
              </TableCell>
            </tr>
          </thead>
          <tbody>
            {contests.map(contest => {
              const candidate = contest.candidates.find(
                c => c.name === votes[contest.id]
              )
              const vote = candidate ? (
                candidate.name
              ) : (
                <Text as="span" muted>
                  no selection
                </Text>
              )
              return (
                <tr key={contest.id}>
                  <TableCell as="th" border>
                    {contest.title}{' '}
                  </TableCell>
                  <TableCell border>
                    {vote}{' '}
                    <small className="no-print">
                      <Link to={`/contests/${contest.id}`}>change</Link>
                    </small>
                  </TableCell>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Main>
      <ButtonBar>
        <Button autoFocus onClick={window.print}>
          Print Ballot
        </Button>
        <Button onClick={props.history.goBack}>Back</Button>
        <Button onClick={requestNewBallot}>New Ballot</Button>
      </ButtonBar>
      <Modal isOpen={isAlert}>
        <Text>Clear all votes and start over?</Text>
        <button onClick={closeAlert}>Cancel</button>
        <button onClick={startOver}>Start Over</button>
      </Modal>
    </React.Fragment>
  )
}

export default SummaryPage
