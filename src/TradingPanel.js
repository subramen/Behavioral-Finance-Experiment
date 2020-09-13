import React from 'react';
import './App.css';

export default class TradingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buy: false,
      sell: false,
      qty: 0};
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClickBuy = this.handleClickBuy.bind(this);
    this.handleClickSell = this.handleClickSell.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.setState({qty: e.target.value});
  }

  handleClickBuy() {
    this.setState((state) => ({
      buy: !this.state.buy,
      sell: false}),
    );
  }

  handleClickSell() {
    this.setState((state) => ({
      buy: false,
      sell: !this.state.sell}),
    );
  }

  handleSubmit() {
    const {price, cash, stocks, processTrade} = this.props;
    const txnVal = this.state.qty * price;

    // check for txn validity
    if (this.state.buy && txnVal <= cash) {
      const nextCash = cash - txnVal;
      const nextStock = stocks + parseInt(this.state.qty);
      processTrade(nextCash, nextStock);
    } else if (this.state.sell && this.state.qty <= stocks) {
      const nextCash = cash + txnVal;
      const nextStock = stocks - parseInt(this.state.qty);
      processTrade(nextCash, nextStock);
    } else if (!this.state.buy && !this.state.sell && this.state.qty === 0) {
      processTrade(cash, stocks);
    } else {
      alert('Invalid Transaction!');
    }

    this.setState({buy: false, sell: false});
  }

  render() {
    return (
      <div style={{alignSelf: 'center'}}>
        <fieldset className="panel">
          <div className="content" style={{marginTop: '20px'}}>
            <div className="input" style={{marginBottom: '30px'}}>
              <InputBox handleInputChange={this.handleInputChange}/>

              <BuySellB
                handleClickBuy={this.handleClickBuy}
                handleClickSell={this.handleClickSell}
                buy={this.state.buy}
                sell={this.state.sell}
              />
            </div>
            <TxnStatus show={this.props.pausedForTrade} buy={this.state.buy} sell={this.state.sell} qty={this.state.qty} />
            <button className="btn submit" disabled={!this.props.pausedForTrade} onClick={this.handleSubmit}>SUBMIT</button>
          </div>
        </fieldset>
      </div>
    );
  }
}

function InputBox(props) {
  return (
    <div className='inputBox'>
      <label htmlFor='in'>No. of Stocks: </label>
      <input type='number' placeholder='0' min='0' onChange={props.handleInputChange}></input>
    </div>
  );
}

class BuySellB extends React.Component {
  render() {
    const buyClass = this.props.buy ? 'btn buy_active' : 'btn buy';
    const sellClass = this.props.sell ? 'btn sell_active' : 'btn sell';
    return (
      <div id='buy-sell-btns' style={{marginTop: '20px'}}>
        <button className={buyClass} onClick={this.props.handleClickBuy}>BUY</button>
        <button className={sellClass} onClick={this.props.handleClickSell}>SELL</button>
      </div>
    );
  }
}

function TxnStatus(props) {
  if (props.show) {
    return (
      <div className="txnStatus">{
        'Your trade: ' +
        (!props.buy && !props.sell ?
          '-' :
          (props.sell ?
            'SELL '+ props.qty +' stocks' :
            'BUY '+ props.qty +' stocks'))
      }</div>
    );
  } else {
    return null;
  }
}
