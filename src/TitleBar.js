import React from 'react';
import './App.css';

export default class TitleBar extends React.Component {
  render() {
    return (
      <div className="titleContainer" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', gridGap: 5}}>
        <h1 style={{textAlign: 'center'}}>AAPL</h1>
        {this.props.dollarTick}
      </div>
    );
  }
}


