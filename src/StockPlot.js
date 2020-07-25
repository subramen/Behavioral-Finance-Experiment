import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';
import 'chartjs-plugin-annotation';
import * as Constant from './constants'


export default class StockPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      datasets: [
        {
          fill: false,
          lineTension: 0.1,
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

      var priceData = {...prevState.datasets[0]};
      priceData.data = [...priceData.data, nextProps.price]; 

      return({
        labels: [...prevState.labels, nextProps.timestamp],
        datasets: [priceData]
      });
    }

    return null;
    
  }

 
  render() {
    return (
      <div className='stockPlot'>
        <Line
          data={this.state}
          options=
          {{
            title:{display:false},
            legend:{display:false},
            annotation: {
              annotations: [
                {
                  type: 'line',
                  mode: 'horizontal',
                  scaleID: 'y-axis-0',
                  value: Constant.PRICE_T0,
                  borderColor: 'rgb(60,0,100)',
                  borderWidth: 1,
                  borderDash: [10,5]
              }]
            }
          }}
        />
      </div>
);
  }
}

