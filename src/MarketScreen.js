import React from 'react';
import './App.css';
import TitleBar from './TitleBar';
import StockPlot from './StockPlot';
import TradingPanel from './TradingPanel';
import StatusTable from './StatusTable';
import Ticker from './Ticker';

export default function MarketScreen(props) {
  if (props.hide) {
    return null;
  } else {
    return (
      <div className="market-screen">
        <PriceTracker pausedForTrade={props.pausedForTrade} price={props.price} timestamp={props.timestamp} price0={props.price0}/>
        <TradeCenter pausedForTrade={props.pausedForTrade} price={props.price} resume={props.resume}/>
      </div>
    );
  }
}


class PriceTracker extends React.Component {
  constructor(props) {
    super(props);
    this.prevPrice = null;
    this.getTicker = this.getTicker.bind(this);
  }

  getTicker() {
    const currPrice = this.props.price;
    const priceDiff = (this.prevPrice ? Math.round((this.props.price - this.prevPrice + Number.EPSILON) * 100) / 100 : 0);

    return [
      <Ticker type='bold' curr={currPrice} diff={priceDiff}/>,
      <Ticker type='percent' curr={currPrice} diff={priceDiff}/>,
    ];
  }

  componentDidMount() {
    if (this.prevPrice !== this.props.price) {
      this.prevPrice = this.props.price;
    }
  }

  componentDidUpdate() {
    if (this.prevPrice !== this.props.price) {
      this.prevPrice = this.props.price;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.price === nextProps.price) {
      return false;
    }
    return true;
  }

  render() {
    const [dollarTick, percentTick] = this.getTicker();
    return (
      <div className="priceTracker">
        <TitleBar dollarTick={dollarTick}/>
        <span style={{display: 'grid'}}>
          <StockPlot price={this.props.price} timestamp={this.props.timestamp} price0={this.props.price0}/>
          <span className='deltaOverlay'>{percentTick}</span>
        </span>

      </div>
    );
  }
}


class TradeCenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cash: 1000,
      stocks: 10,
    };
    this.processTrade = this.processTrade.bind(this);
  }

  processTrade(cash, stocks) {
    if (this.props.pausedForTrade) {
      this.setState({cash, stocks});
      alert('Trade Submitted!');
      this.props.resume();
    }
  }

  render() {
    const {cash, stocks} = this.state;
    return (
      <div style={{display: 'grid', gridTemplateRows: '1fr 4fr 3fr 2fr'}}>
        <Message pausedForTrade={this.props.pausedForTrade} />
        <TradingPanel pausedForTrade={this.props.pausedForTrade} price={this.props.price} cash={cash} stocks={stocks} processTrade={this.processTrade}/>
        <StatusTable price={this.props.price} cash={cash} stocks={stocks}/>
      </div>
    );
  }
}


function Message(props) {
  const out = (props.pausedForTrade ? 'Enter a trade' : 'Observe the market');
  return (
    <h2>{out}</h2>
  );
}
