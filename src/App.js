import React from 'react';
import './App.css';
import MarketScreen from './MarketScreen';
import Modal from './Modal';
import data from './data/data.json';
import { stats } from './stats'
import Countdown from './timer';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowIndex: 0,
      marketPaused: true,
      showModalFlag: false,
    };

    this.WATERCOOLER = true;
    [this.timestamps, this.prices, this.pauseIndices,
    this.randomStonkName, this.sample_start, this.sample_end, this.prescaledVar, this.postscaledVar] = RandomStonker();
    this.modalChild = null;

    this.incrementIndex = this.incrementIndex.bind(this);
    this.handleTimedEvents = this.handleTimedEvents.bind(this);
    this.unpauseTrading = this.unpauseTrading.bind(this);
    this.setModalFlag = this.setModalFlag.bind(this);
    this.showWatercoolerModal = this.showWatercoolerModal.bind(this);
    this.showConcludeModal = this.showConcludeModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    // this.one = this.one.bind(this);
    // this.five = this.five.bind(this);
    // this.ten = this.ten.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(
        () => this.incrementIndex(),
        1000,
    );
  }


  // ############ TIME CONTROL ############
  incrementIndex() {
    // increment index only when trading is inactive
    if (!this.state.marketPaused) {
      this.setState(
          (state) => ({nowIndex: state.nowIndex + 1}),
      );
    }
    this.handleTimedEvents();
  }

  handleTimedEvents() {
    // Pause for trading windows
    if ( this.pauseIndices[0] <= this.state.nowIndex && this.state.nowIndex <= this.pauseIndices[1]) {

      if (this.pauseIndices.includes(this.state.nowIndex)) {
        this.setState({marketPaused: true});
        this.closeModal();
        // market is unPaused when trade is submitted
      }

      else if (this.WATERCOOLER && !this.state.showModalFlag) {
        this.showWatercoolerModal();
      }
    }

    // conclude experiment
    if (this.state.nowIndex === this.timestamps.length) {
      this.showConcludeModal();
      clearInterval(this.timerID);
      this.setState({nowIndex: this.timestamps.length-1});
    }
  }

  unpauseTrading() {
    this.setState({marketPaused: false});
  }
  // ############ TIME CONTROL ############


  // ############ MODAL CONTROL ############
  setModalFlag(flag) {
    this.setState({showModalFlag: flag});
  }

  showWatercoolerModal() {
    this.setModalFlag(true);
    this.modalChild = WatercoolerScreen();
  }

  showConcludeModal() {
    this.setModalFlag(true);
    this.modalChild = (
      <div>
        <h1>Experiment complete</h1>
      </div>
    );
  }

  closeModal() {
    if (this.state.nowIndex >= this.pauseIndices[1]) {
      this.setModalFlag(false);
      this.modalChild = null;
    }
  }
  // ############ MODAL CONTROL ############


  // ############ EXPERIMENTAL ############
  one() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
        () => this.incrementIndex(),
        1000,
    );
  }

  five() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
        () => this.incrementIndex(),
        200,
    );
  }

  ten() {
    clearInterval(this.timerID);
    this.timerID = setInterval(
        () => this.incrementIndex(),
        50,
    );
  }
  // ############ EXPERIMENTAL ############


  render() {
    const price = Math.round((this.prices[this.state.nowIndex] + Number.EPSILON) * 100) / 100;
    const price0 = Math.round((this.prices[0] + Number.EPSILON) * 100) / 100;
    const timestamp = this.timestamps[this.state.nowIndex];

    return (
      <div className="App">
        <div className="App-container" >
          <Modal show={this.state.showModalFlag} onClose={this.closeModal} children={this.modalChild}/>
          <MarketScreen price={price} timestamp={timestamp} pausedForTrade={this.state.marketPaused}
                        unpauseTrading={this.unpauseTrading} price0={price0} trade0_ts={this.timestamps[this.pauseIndices[0]]}
                        trade1_ts={this.timestamps[this.pauseIndices[1]]}/>
          <button id="start-exp" className="btn" onClick={this.unpauseTrading} disabled={this.state.nowIndex}>Start</button>
        </div>
      </div>
    );
  }
}


function WatercoolerScreen() {
  return (
    <div>
      <h1>Water Break - Take a 5 minute break from the market</h1>
      <h2>Hydrate, check your notifications or simply close your eyes and focus on your breath.</h2>
      <h2>The market will resume after 5 minutes, so be sure to be back!</h2>
      <Countdown then={Date.now() + 60000}/>,
      <br />
      <h3>For the control group, the experiment continues undisturbed.</h3>
    </div>
  );
}


function RandomStonker(wcMins=1) {
  function IncreaseVariance(prices,multiplier=2) { // shape preserving
    const mean_price = stats.mean(prices)
    let scaledPrices = prices.map( x => mean_price + multiplier * (x - mean_price))
    return scaledPrices
  }

  const interval = 1; // seconds between two data points
  // const sample_size = expMins * 60 / interval;
  const sample_size = wcMins * (60 / interval) * (100 / 40);

  // CHOOSE A RANDOM STONK
  const stonks = data.stonks; // list
  const ix = Math.round(Math.random()*(stonks.length-1));
  let randomStonk = stonks[1];

  // // RANDOM SAMPLE THE STONK
  const N = randomStonk.timestamps.length;
  const sample_start = Math.round(Math.random()*(N-sample_size)); // rand(0, N-sample_size)
  const sample_end = sample_start + sample_size;

  const timestamps = randomStonk.timestamps.slice(sample_start, sample_end);
  let prices = randomStonk.prices.slice(sample_start, sample_end);
  const prescaledVar = stats.variance(prices)
  prices = (stats.variance(prices) < 30 ? IncreaseVariance(prices) : prices);
  const postscaledVar = stats.variance(prices)
  const pauseIndices = [Math.floor(sample_size*4/10), Math.floor(sample_size*8/10)];

  return [timestamps, prices, pauseIndices, randomStonk.name, sample_start, sample_end, prescaledVar, postscaledVar]
}



class ExperimentSpeed extends React.Component {
  render() {
    return (
      <div style={{marginTop: '20px'}}>
        <button className="btn" onClick={this.props.one}>1x</button>
        <button className="btn" onClick={this.props.five}>5x</button>
        <button className="btn" onClick={this.props.ten}>10x</button>
      </div>
    );
  }
}
