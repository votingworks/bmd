import React, { Component } from 'react';


class PrintableBallot extends Component {
  constructor(props) {
    super(props);
    this.state = {election: props.election, ballot: props.ballot}
  }

  render() {
    let rows = []

    // Outer loop to create parent
    for (let contest of this.state.election.contests) {
      rows.push(<tr key={contest.id}><th align="left" width="30%">{contest.name}</th><td>{contest.options[this.state.ballot[contest.id]]}</td></tr>);
    }

    return (
      <table width="100%" style={{fontSize: "1.5em"}}>
        <tbody>
          <tr key="title"><th colSpan="2" style={{fontSize: "2em"}}>Official Ballot</th></tr>
          <tr key="space"><th>&nbsp;</th></tr>
          {rows}
        </tbody>
      </table>
    );
  }
}

export default PrintableBallot;
