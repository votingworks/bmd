import React, { Component } from 'react';

import BallotContest from './BallotContest';
import Button from '@material-ui/core/Button';
class Ballot extends Component {
  constructor(props) {
    super(props);
    this.election = props.election;
    this.ballotready = props.onBallotReady;
    this.state = {position: 0, choices: {}};
  }

  next() {
    if (this.state.position+1 >= this.election.contests.length) {
      this.ballotready(this.state.choices);
    } else {
      this.setState({position: this.state.position+1, choices: this.state.choices});
    }
  }

  previous() {
    this.setState({position: this.state.position-1, choices: this.state.choices});   }

  print() {
    this.ballotready(this.state.choices);
  }

  render() {
    let election = this.election;

    let buttons = [];
    if (this.state.position > 0) {
      buttons.push(
        <Button key="previous" size="large" variant="contained" onClick={()=>{this.previous();}} style={{margin: "20px", padding: "20px"}}>Previous</Button>
      );
    }

    buttons.push(
      <Button key="next" size="large" variant="contained" onClick={()=>{this.next();}} style={{margin: "20px", padding: "20px"}}>Next</Button>
    );

    return (
      <div>
        <h1>{election.title}</h1>
        <div>
          <BallotContest
            key={this.state.position}
            contest={this.election.contests[this.state.position]}
            choices={this.state.choices}
          />
        </div>
      <div style={{padding: "20px"}}>
          {buttons}
        </div>
      </div>
    );
  }
}

export default Ballot;
