import React from 'react';

class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <h1>Dashboard with stock plot and controls</h1>
        {this.props.timer.map((time) => <h3>{time}</h3>)}
      </div>
    );
  }
}

export default Dashboard;
