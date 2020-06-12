import React from 'react';
import './App.css';
import Ticker from './Ticker'

export default class TitleBar extends React.Component {
    constructor(props) {
      super(props);
      this.prevPrice = null;
      this.getTicker = this.getTicker.bind(this)
    }
  
    getTicker() {
      var currPrice = this.props.price;
      var priceDiff = (this.prevPrice ? Math.round((this.props.price - this.prevPrice + Number.EPSILON) * 100) / 100 : 0);
      return <Ticker bold={true} curr={currPrice} diff={priceDiff}/>;
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

    shouldComponentUpdate(nextProps, nextState){
      if (this.props.price === nextProps.price) {
        return false;
      }
      return true;
    }

    render() {
      return (
        <div className="titleContainer" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 3fr", gridGap: 5 }}>
          <h1 style={{textAlign: "center"}}>AAPL</h1>
          {this.getTicker()}
        </div>
      );
    }
  }
  

  

  
  