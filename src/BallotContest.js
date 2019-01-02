import React, { Component } from 'react';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';

class BallotContest extends Component {
  handleChange = event => {
    let value = event.target.value;
    this.setState({ value: value });
    this.choices[this.contest.id] = value;
  };

  constructor(props) {
    super(props);
    this.contest = props.contest;
    this.choices = props.choices;
    this.state = {value: this.choices[this.contest.id]};
  }

  render() {
    let contest = this.contest;

    let rows = [];

    // Outer loop to create parent
    contest.options.forEach((option, i) => {
      rows.push(
        <FormControlLabel
          value={""+i}
          label={<Typography style={{fontSize: "2em"}}>{option}</Typography>}
          control={<Radio />}
          labelPlacement="end"
          key={i}
          style={{margin: "10px", padding: "20px", border: "1px solid #ddd"}}
        />
      );
    });

    return (
      <FormControl component="fieldset">
        <FormLabel component="legend" style={{fontSize: "2.5em", padding: "20px"}}>{contest.name}</FormLabel>
        <RadioGroup
          aria-label={contest.id}
          name={contest.id}
          value={this.state.value}
          onChange={this.handleChange}
        >
        {rows}
        </RadioGroup>
      </FormControl>
    );

  }
}

export default BallotContest;
