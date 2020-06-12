import React from 'react';
import './App.css';
import TitleBar from './TitleBar';
import StockPlot from './StockPlot';
import TradingPanel from './TradingPanel';
import StatusTable from './StatusTable';

export default function MarketScreen(props) {
    if (props.hide) {
      return null;
    }
    else {
      return (
        <div className="market-screen">
          <PriceTracker pausedForTrade={props.pausedForTrade} price={props.price} timestamp={props.timestamp} />
          <TradeCenter pausedForTrade={props.pausedForTrade} price={props.price} resume={props.resume}/>
        </div>
      );  
    }
  }
  
  function PriceTracker(props) {
    return(
      <div style={{display:"grid", gridTemplateRows: "1fr 7fr 2fr"}}>
        <TitleBar pausedForTrade={props.pausedForTrade} price={props.price}/>
        <StockPlot price={props.price} timestamp={props.timestamp}/>
      </div>
    );
  }
  
  
  class TradeCenter extends React.Component{  
    constructor(props) {
      super(props);
      this.state = {
        cash: 1000,
        stocks: 10
      }
      this.processTrade = this.processTrade.bind(this);
    }
  
    processTrade(cash, stocks) {
      if (this.props.pausedForTrade) {
        this.setState({cash, stocks});
        alert('Trade Submitted!')
        this.props.resume();
      }
    }
    
    render() {
      let {cash, stocks} = this.state;
      return (
        <div style={{display:"grid", gridTemplateRows: "1fr 4fr 3fr 2fr"}}>
          <Message pausedForTrade={this.props.pausedForTrade} />
          <TradingPanel pausedForTrade={this.props.pausedForTrade} price={this.props.price} cash={cash} stocks={stocks} processTrade={this.processTrade}/>    
          <StatusTable price={this.props.price} cash={cash} stocks={stocks}/>
      </div>
      )
      
    }
  }
  
  
  function Message (props) {
    const out = (props.pausedForTrade ? "Enter a trade" : "Observe the market");
    return (
      <h2>{out}</h2>
    );
  }
  
