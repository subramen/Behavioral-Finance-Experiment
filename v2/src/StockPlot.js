import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';


export default class StockPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      datasets: [
        {
          // label: false,
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,
          data: []
        }
      ]
    };
  }
  
  // Update State data with new props
  static getDerivedStateFromProps(nextProps, prevState) {

    if (prevState.labels.length === 0 || prevState.labels[prevState.labels.length -1] !== nextProps.timestamp) {

      var newDatasets = {...prevState.datasets[0]};
      newDatasets.data = [...newDatasets.data, nextProps.price]; // call by value to prevent data fuckery

      return({
        labels: [...prevState.labels, nextProps.timestamp],
        datasets: [newDatasets]
      });
    }

    return null;
    
  }

 
  render() {
    return (
      <div>
        <Line
          data={this.state}
          options={{
            title:{display:false},
            legend:{display:false}
          }}
          />
      </div>
);
  }
}

