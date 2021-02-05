import React from 'react';
import './App.css';
import { stats } from './stats'
import PropTypes from 'prop-types';


export default class TradingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buy: false,
      sell: false,
      inputQty: 0};
    this.updateInput = this.updateInput.bind(this);
    this.handleClickBuy = this.handleClickBuy.bind(this);
    this.handleClickSell = this.handleClickSell.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getTxnStats = this.getTxnStats.bind(this);
    this.getFeedbackStatus = this.getFeedbackStatus.bind(this);
  }

  updateInput(e) {
    this.setState({inputQty: e.target.value});
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

  getTxnStats() {
    const { price, cash, stocks } = this.props;
    const { buy, sell, inputQty } = this.state;
    return {
      maxQty : (buy ? Math.floor(cash/price) : (sell ? stocks : 0)),
      nextCash: stats.precisionRound((buy ? cash - (inputQty * price) :  cash + (inputQty * price)), 2),
      nextStock: (buy ? stocks + parseInt(inputQty) :  stocks - parseInt(inputQty)),
    };

  }

  handleSubmit() {
    const { nextCash, nextStock } = this.getTxnStats();
    this.props.processTrade(nextCash, nextStock);
    this.setState({buy: false, sell: false});
  }

  getFeedbackStatus() {
    const { buy, sell, inputQty } = this.state;
    const { maxQty, nextCash } = this.getTxnStats();

    const maxQtyStatus = (
      buy || sell ?
      'Stocks available for  ' + (sell ? 'sale' : 'purchase') + ': ' + maxQty :
      ''
    );

    const yourTrade = (
      this.props.pausedForTrade ?
        (
          'Your trade: ' +
          buy ?
            'Buy ' + inputQty + ' stocks' :
            (sell ? 'Sell ' + inputQty + 'stocks' : '-')
        ) :
        ''
    );

    const remCashStatus = (
      (this.props.pausedForTrade && (buy || sell)) ?
      'Your cash after this trade: $' + nextCash :
      ''
    );

    return {
      maxQty: <div id='max-qty-status'>{maxQtyStatus}</div>,
      yourTrade: <div id='your-trade-status'>{yourTrade}</div>,
      remCash: <div id='rem-cash-status'>{remCashStatus}</div>,
    }
  }

  render() {
    return (
      <div style={{alignSelf: 'center'}}>
        {this.getFeedbackStatus().maxQty}
        <fieldset className="panel">
          <div className="content" style={{marginTop: '10px'}}>
            <div className="input" style={{marginBottom: '30px'}}>
              <BuySellB
                handleClickBuy={this.handleClickBuy}
                handleClickSell={this.handleClickSell}
                buy={this.state.buy}
                sell={this.state.sell}
              />
              <ValidatedInputBox
                updateInput={this.updateInput}
                txnStats={this.getTxnStats}
                disabled={!this.props.pausedForTrade}
              />
            </div>
            {this.getFeedbackStatus().remCash}
            <button className="btn submit" disabled={!this.props.pausedForTrade} onClick={this.handleSubmit}>SUBMIT</button>
          </div>
        </fieldset>
      </div>
    );
  }
}


function ValidatedInputBox(props) {
  return (
    <div className='inputBox'>
      <label htmlFor='in'>No. of Stocks: </label>
      <input
        type='number'
        placeholder={0}
        min={0}
        max={props.txnStats().maxQty}
        onChange={props.updateInput}
        disabled={props.disabled}
        onKeyDown={(e) => {e.preventDefault();}}
      />
    </div>
  );
}

class BuySellB extends React.Component {
  render() {
    const buyClass = this.props.buy ? 'btn buy_active' : 'btn buy';
    const sellClass = this.props.sell ? 'btn sell_active' : 'btn sell';
    return (
      <div id='buy-sell-btns' style={{marginBottom: '20px'}}>
        <button className={buyClass} onClick={this.props.handleClickBuy}>BUY</button>
        <button className={sellClass} onClick={this.props.handleClickSell}>SELL</button>
      </div>
    );
  }
}
