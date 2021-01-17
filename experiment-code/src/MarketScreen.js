import React from 'react';
import './App.css';
import TitleBar from './TitleBar';
import StockPlot from './StockPlot';
import TradingPanel from './TradingPanel';
import StatusTable from './StatusTable';
import Ticker from './Ticker';
import Joyride from 'react-joyride';


export default class MarketScreen extends React.Component{
  state = {
    walkthroughSteps: [
      {
        target: '.market-screen',
        title: 'Welcome!',
        content: <p>In this experiment, you will be trading a randomly-chosen major currency pair on the Forex spot market.<br/><br/>
        Take advantage of the volatile market to make maximum profit!</p>,
        event: 'hover',
        placement: 'center'
      },
      {
        target: '#stock-plot',
        title: 'Price Graph',
        content: <p>Keep track of the changes in the exchange rate here.<br/><br/>The dashed line indicates the initial exchange rate.</p>,
        event: 'hover',
        offset: 0,
      },
      {
        target: '#percent-tick',
        content: 'Indicates the % change from the initial exchange rate.',
        event: 'hover',
        offset: 0,
      },
      {
        target: '#status-message',
        title: 'Trading Window Status',
        content: <p>You may place trades only when the window is open.<br/><br/>The trading window will open twice during the experiment.</p>,
        event: 'hover',
        placement: 'auto'
      },
      {
        target: '#buy-sell-btns',
        title: 'Placing a Trade - Step 1/3',
        content: 'Click on either Buy or Sell...',
        event: 'hover',
        placement: 'auto'
      },
      {
        target: '.inputBox',
        title: 'Placing a Trade - Step 2/3',
        content: 'Enter the number of units you want to trade (0 or more)...',
        event: 'hover',
        placement: 'auto'
      },
      {
        target: '.btn.submit',
        title: 'Placing a Trade - Step 3/3',
        content: 'And click here to confirm the trade.',
        event: 'hover',
        placement: 'auto'
      },
      {
        target: '.grayTable',
        title: 'Assets',
        content: <p>Here you can see your current holdings, net worth (cash + stock), and your Profit/Loss since the start of the experiment.<br/><br/>You will start with $1000 and 10 units of the currency.</p>,
        event: 'hover',
        placement: 'auto'
      },
      {
        target: '#start-exp',
        title: 'Good luck!',
        content: <p>The experiment will last for 10 minutes. Ensure you are undisturbed for the entire duration. <br/><br/>Click here to begin!</p>,
        event: 'hover',
        placement: 'auto'
      },
    ],
  }

  render() {
    return (
      <div>
        <Joyride
          continuous={true}
          showProgress={true}
          showSkipButton={true}
          steps={this.state.walkthroughSteps}
          styles={{
            options: {
              placement: 'auto',
              zIndex: 1000,
            },
            tooltip: {
              fontFamily: 'Lato',
              fontSize: 18,
              offset: 0,
            },
          }}
          locale={{last:'Close'}}
        />
        <div className="market-screen">
          <PriceTracker price={this.props.price} timestamp={this.props.timestamp}
          price0={this.props.price0} trade0_ts={this.props.trade0_ts} trade1_ts={this.props.trade1_ts}/>
          <TradeCenter
            pausedForTrade={this.props.pausedForTrade}
            price={this.props.price}
            unpauseTrading={this.props.unpauseTrading}
            isWalkthrough={this.props.isWalkthrough}
          />
        </div>
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
      <Ticker type='percent' curr={currPrice} diff={currPrice - this.props.price0}/>,
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
          <StockPlot price={this.props.price} timestamp={this.props.timestamp}
          price0={this.props.price0} trade0_ts={this.props.trade0_ts} trade1_ts={this.props.trade1_ts}/>
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
    this.setState({cash, stocks});
    alert('Trade Submitted!');
    this.props.unpauseTrading();
  }

  render() {
    const {cash, stocks} = this.state;
    return (
      <div style={this.props.isWalkthrough ? {pointerEvents: "none"} : {display: 'grid', gridTemplateRows: '1fr 4fr 3fr 2fr'}}>
        <StatusMessage pausedForTrade={this.props.pausedForTrade} />
        <TradingPanel pausedForTrade={this.props.pausedForTrade} price={this.props.price} cash={cash} stocks={stocks} processTrade={this.processTrade} />
        <StatusTable price={this.props.price} cash={cash} stocks={stocks}/>
      </div>
    );
  }
}


function StatusMessage(props) {
  const out = (props.pausedForTrade ? 'Enter a trade' : 'Observe the market');
  return (
    <h2 id='status-message'>{out}</h2>
  );
}
