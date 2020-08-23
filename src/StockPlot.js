import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';
import 'chartjs-plugin-annotation';
import * as Constant from './constants';


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
          data: [],
        },
      ],
      lineColor: 'rgb(60,0,100)',
    };
  }

  // Update State data with new props
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.labels.length === 0 || prevState.labels[prevState.labels.length -1] !== nextProps.timestamp) {
      const priceData = {...prevState.datasets[0]};
      priceData.data = [...priceData.data, nextProps.price];
      const lineColor = nextProps.price >= nextProps.price0 ? 'green' : 'red'

      return ({
        labels: [...prevState.labels, nextProps.timestamp],
        datasets: [priceData],
        lineColor: lineColor,
      });
    }

    return null;
  }


  render(nextProps) {

    return (
      <div className='stockPlot'>
        <Line
          data={this.state}
          options=
            {{
              title: {display: false},
              legend: {display: false},
              annotation: {
                annotations: [
                  {
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: this.props.price0,
                    borderColor: this.state.lineColor,
                    borderWidth: 1,
                    borderDash: [10, 5],
                  }],
              },
            }}
        />
      </div>
    );
  }
}
