import React from 'react';
import './App.css';
import MarketScreen from './MarketScreen';
import Modal from './Modal';
import data from './data/data.json';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowIndex: 0,
      marketPaused: false,
      showModal: false,
    };

    this.WATERCOOLER = true;

    // CHOOSE A RANDOM STONK
    const stonks = data.stonks; // list
    const ix = Math.round(Math.random()*(stonks.length-1));
    this.randomStonk = stonks[ix];

    // // RANDOM SAMPLE THE STONK
    const N = this.randomStonk.timestamps.length;
    const SAMPLING_RATE = 0.3;
    const sample_size = Math.floor(N*SAMPLING_RATE);
    const sample_start = Math.round(Math.random()*(N-sample_size)); // rand(0, sample_size)
    const sample_end = sample_start + sample_size;


    this.timestamps = this.randomStonk.timestamps.slice(sample_start, sample_end);
    this.prices = this.randomStonk.prices.slice(sample_start, sample_end);
    this.pauseIndices = [Math.floor(sample_size*4/10), Math.floor(sample_size*8/10)];

    this.modalChild = null;

    this.incrementIndex = this.incrementIndex.bind(this);
    this.handleTimedEvents = this.handleTimedEvents.bind(this);
    this.unpauseTrading = this.unpauseTrading.bind(this);
    this.setModal = this.setModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.one = this.one.bind(this);
    this.five = this.five.bind(this);
    this.ten = this.ten.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(
        () => this.incrementIndex(),
        1000,
    );
  }

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
    if (this.pauseIndices.includes(this.state.nowIndex)) {
      this.setState({marketPaused: true});
    }

    if (this.WATERCOOLER && this.state.nowIndex > this.pauseIndices[0] && this.state.nowIndex < this.pauseIndices[1]) {
      this.setModal(true);
      this.modalChild = FillerOrScreen();
    }

    if (this.WATERCOOLER && this.state.nowIndex >= this.pauseIndices[1]) {
      this.setModal(false);
      this.modalChild = null;
    }

    // conclude experiment
    if (this.state.nowIndex === this.timestamps.length) {
      console.log('hit2');
      this.setModal(true);
      this.modalChild = Conclude();
      clearInterval(this.timerID);
      this.setState({nowIndex: this.timestamps.length-1});
    }
  }

  unpauseTrading() {
    this.setState({marketPaused: false});
  }

  setModal(flag) {
    this.setState({showModal: flag});
  }

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
        100,
    );
  }

  closeModal() {
    if (this.state.nowIndex > this.pauseIndices[1]) {
      this.setModal(false);
      this.modalChild = null;
    }
  }

  render() {
    const price = Math.round((this.prices[this.state.nowIndex] + Number.EPSILON) * 100) / 100;
    const price0 = Math.round((this.prices[0] + Number.EPSILON) * 100) / 100;
    const timestamp = this.timestamps[this.state.nowIndex];

    return (
      <div className="App">
        <div className="App-container" >
          <Modal show={this.state.showModal} onClose={this.closeModal} children={this.modalChild}/>
          <MarketScreen price={price} timestamp={timestamp} pausedForTrade={this.state.marketPaused}
                        resume={this.unpauseTrading} price0={price0}/>
          <ExperimentSpeed one={this.one} five={this.five} ten={this.ten}/>
          <div>
            <p>{this.randomStonk.name}  {this.pauseIndices[0]}  {this.pauseIndices[1]}</p>
            <p>{this.state.nowIndex}</p>
          </div>
        </div>
      </div>
    );
  }
}


function FillerOrScreen() {
  return (
    <div>
      <h1>Water Break - Take a 5 minute break from the market</h1>
      <h2>Hydrate, check your notifications or simply close your eyes and focus on your breath.</h2>
      <h2>The market will resume after 5 minutes, so be sure to be back!</h2>
      <br />
      <h3>For the control group, the experiment continues undisturbed.</h3>
    </div>
  );
}


function Conclude() {
  return (
    <div>
      <h1>Experiment complete</h1>
    </div>
  );
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


export default App;
