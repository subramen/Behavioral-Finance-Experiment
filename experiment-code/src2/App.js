import React, { useEffect, useState } from 'react';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
  } from 'recoil';
import Ticker from './components/Ticker'
import './App.css';


const T1 = 5;
const T2 = 20;
const TN = 100;
const WC = true;


const nowState = atom({
    key: 'nowState', // unique ID (with respect to other atoms/selectors)
    default: 0, // default value (aka initial value)
});

const showModalState = atom({
    key: 'showModalState', 
    default: false,
});

const mktPauseState = atom({
    key: 'mktPauseState',
    default: true,
})

const configState =  atom({
  key: 'configState',
  default: {
    'T1': 5,
    'T2': 20,
    'TN': 100,
    'WC': true,
    'price0': 0,
  }
});


const currentPriceState;
const prevPriceState;

const rtQuotes = atom({
  key: 'real-time-quotes',
  default: {
    'timestamps': ['ts'],
    'quote': [0]
  }
}); 





export default function App() {
  const isWalkthrough;

  return (
    <RecoilRoot>
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        <StockMarket />
      </div>
    </RecoilRoot>
  );
  }


const StockMarket = ({ wc, t0, t1, tN }) => {
  const [now, setNow] = useRecoilState(nowState);
  const [mktPause, setMktPause] = useRecoilState(mktPauseState);
  const [showModal, setShowModal] = useRecoilState(showModalState);

  useEffect(() => {
      // increment now every 1000ms if market is unpaused
      const interval = setInterval(() => {
          if (!mktPause) setNow(now + 1);            
      }, 1000);
      return () => { clearInterval(interval); };
  }, []);
};


const Walkthrough = () => {
  walkthroughSteps = [
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
  ];

  return (
    <Joyride
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      steps={walkthroughSteps}
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
  );
};


const Modal = ({ show, children }) => {
    if (show) {
        return (
            <div className="modal-backdrop">
              <div className="modal-content">
                {children}
                <div className="footer" />
              </div>
            </div>
          );
    }
};


const Tickers = () => {
  const price0 = useRecoilValue(configState).price0;
  const price = useRecoilValue(currentPriceState);
  const prevPrice = useRecoilValue(prevPriceState);
  const priceDiff = (prevPrice ? Math.round((price - prevPrice + Number.EPSILON) * 100) / 100 : 0);

  return [
    <Ticker type='bold' curr={price} diff={priceDiff}/>,
    <Ticker type='percent' curr={price} diff={price - price0}/>,
  ];
};



const PriceTracker = () => {
  const TitleBar = ({ dollarTick }) => {
    return (
      <div className="titleContainer" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', gridGap: 5}}>
        <h1 className="tickerName">USD/MRS</h1>
        {dollarTick}
      </div>
    );
  };


};


const StockPlot = () => {
  // const labels = useRecoilValue(rtQuotes).timestamps;
  // const prices = useRecoilValue(rtQuotes).quote;
  const chartMeta = {
    labels: useRecoilValue(rtQuotes).timestamps,
    datasets: [
      {
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: useRecoilValue(rtQuotes).quote,
      },
    ],
    lineColor: 'rgb(60,0,100)',
  };

  


};
