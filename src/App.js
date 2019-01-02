import React, { Component } from 'react';
import PrintProvider, { Print, NoPrint } from 'react-easy-print';
import './App.css';


import QrReader from 'react-qr-scanner';

import Ballot from './Ballot';
import PrintableBallot from './PrintableBallot';

var ELECTION = {
  id: "DEMO",
  title: "Demo Election",
  contests: [
    {
      id: "president",
      type: "plurality",
      name: "President",
      options: [
        "Minnie Mouse",
        "Mickey Mouse",
        "Donald Duck"
        ]
    },
    {
      id: "senator",
      type: "plurality",
      name: "Senator",
      options: [
        "Chad Hanging",
        "Lev Ermachine",
        "John Smith"
        ]
    }
  ]
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.election = ELECTION;
  }

  ballotReady(ballot) {
    this.setState({ballot: ballot});
  }

  print() {
    window.print();
  }

  handleScan(data) {
    if (data!=null) {
      console.log(data);
    }
  }

  handleError() {
  }

  render() {
    let mainContent, printableBallot;

    if (!this.election) {
      printableBallot = (<div></div>);

      const previewStyle = {
        height: 440,
        width: 620
      };

      mainContent = (
        <div align="center">
          <QrReader
            style={previewStyle}
            onError={this.handleError}
            onScan={this.handleScan}
          />
        </div>
      );
    } else {

      if (this.state.ballot) {
        printableBallot = (
          <PrintableBallot election={this.election} ballot={this.state.ballot} />
        );

        mainContent = (
          <div>
            <div style={{paddingLeft: "400px", paddingRight: "400px", paddingBottom: "50px"}}>{printableBallot}</div>
            <button onClick={this.print.bind(this)} style={{fontSize: "2.5em"}}>Print</button>
          </div>

        );
      } else {
        printableBallot = (<div></div>);
        mainContent = (
          <Ballot election={this.election} onBallotReady={this.ballotReady.bind(this)} />
        );
      }
    }


    return (
      <PrintProvider>
        <Print single printOnly name="ballot">
          {printableBallot}
        </Print>

        <NoPrint force>
          <div className="App">
            <img src="./vw-checkmark.png" className="App-logo" alt="logo" />
            {mainContent}
          </div>
      </NoPrint>
      </PrintProvider>
    );
  }
}

export default App;
