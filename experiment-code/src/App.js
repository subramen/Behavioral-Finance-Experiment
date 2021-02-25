import React, { useEffect, useState, Suspense } from 'react';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    constSelector,
  } from 'recoil';
import Ticker from './Ticker'
import { stats } from './stats'
import Countdown from './components/timer'
import Joyride from 'react-joyride';
import {Line} from 'react-chartjs-2';
import './App.css';
import { now } from 'moment';

const API_URL = 'http://localhost:5000';

const expStartTimeState = atom({
  key: 'expStartTS',
  default: 0,
})
const intervalMultiplierState = atom({
  key: 'intervalMultiplierState',
  default: 5,
})
const nowIdxState = atom({
    key: 'nowIdxState', 
    default: 0, 
});

const expPauseState = atom({
    key: 'expPauseState',
    default: true,
})

const configState =  atom({
  key: 'configState',
  default: {
    T1: 50,
    T2: 100,
    TN: 300,
    WC: true,
    price0: 0,
    initCash: 1000,
  }
});

const fetchQuote = selector({
  key: 'fetchQuoteSelector',
  get: async ({get}) => {
    try {
      const response = await fetch(API_URL + '/get');
      const data = await response.json();
      console.log("fetchQuote: ", data);
      return data;
    } catch (error) {
      throw error;
    }
  }
});

const fetchQuoteSlice = selector({
  key: 'fetchQuoteSliceSelector',
  get: async ({get}) => {
    const expStartTS = get(expStartTimeState);
    const multiplier = get(intervalMultiplierState);
    const nowIdx = get(nowIdxState);
    let data = {"labels": [], "quotes": []};
    try {
      if (expStartTS > 0) {
        const response = await fetch(API_URL + '/slice/' + 
        expStartTS + '/' + (expStartTS + nowIdx * multiplier));
        data = await response.json();
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
});


// State atoms 

const cashState = atom({
  key:'cashState',
  default: 1000,
});

const stockState = atom({
  key:'stockState',
  default: 10,
});

const buySellState = atom({
  key: 'buySellState',
  default: {
    buy: false,
    sell: false,
  }
});

const selectMaxQty = selector({
  key: 'maxQty',
  get: ({get}) => {
    const cash = get(cashState);
    const {price, x} = get(fetchQuote);
    const stock = get(stockState);
    const {buy, sell} = get(buySellState);
    return (buy ? Math.floor(cash/price) : (sell ? stock : 0))
  }
});

const isTimeToTrade = selector({
  key: 'isTimeToTrade',
  get: ({get}) => {
    const nowIdx = get(nowIdxState);
    const T1 = get(configState).T1;
    const T2 = get(configState).T2;
    return (nowIdx === T1 || nowIdx === T2);
  }
});

const showWatercoolerModal = selector({
  key: 'showWC',
  get: ({get}) => {
    const nowIdx = get(nowIdxState);
    const T1 = get(configState).T1;
    const T2 = get(configState).T2;
    const WC = get(configState).WC;
    return (WC && T1 < nowIdx && nowIdx <T2);
  }
});


export default function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <ExperimentDisplay />
      </div>
    </RecoilRoot>
  );
}

const ExperimentDisplay = () => {
  const [nowIdx, setNowIdx] = useRecoilState(nowIdxState);
  const [expPause, setExpPause] = useRecoilState(expPauseState);
  const setExpStartTime = useSetRecoilState(expStartTimeState);
  const timeInterval = useRecoilValue(intervalMultiplierState);
  const isTradeTime = useRecoilValue(isTimeToTrade);

  useEffect(() => {
      // pause at T1 or T2. mkt is unpaused when trade is submitted.
      if (isTradeTime) setExpPause(true);

      // increment `nowIdx` every 1000ms if market is unpaused
      const interval = setInterval(() => {
          if (!expPause) setNowIdx(nowIdx + timeInterval);            
      }, timeInterval * 1000);
      console.log("now", nowIdx);

      return () => { clearInterval(interval); };
  });

  return (
    <div className="App-container">
      <Modal />
      <MarketScreen />
      <button id="start-exp" 
        className="btn" 
        onClick={() => {
          setExpPause(false); 
          setExpStartTime(Math.round(Date.now()/1000));
        }}
        disabled={nowIdx}>Start</button>
    </div>
  );
};



const Modal = () => {
  const showWC = useRecoilValue(showWatercoolerModal);
  const watercoolerModal = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div>
          <h1>Water Break - Take a 5 minute break from the market</h1>
          <h2>Hydrate, check your notifications or simply close your eyes and focus on your breath.</h2>
          <h2>The market will resume after 5 minutes, so be sure to be back!</h2>
          <Countdown then={Date.now() + 60000}/>,
          <br />
          <h3>For the control group, the experiment continues undisturbed.</h3>
        </div>
        <div className="footer" />
      </div>
    </div>
  );
  
  return (showWC ? watercoolerModal : null);
};


const MarketScreen = () => {
  const nowIdx = useRecoilValue(nowIdxState);
  const isWalkthrough = (nowIdx === 0);

  return (
    <div>
      <Walkthrough />
      <div className="market-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <StockDisplay />
          <TradeCenter isWalkthrough={isWalkthrough} />
        </Suspense>
      </div>
    </div>
  ); 
};


const Walkthrough = () => {
  const walkthroughSteps = [
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


const StockDisplay = () => {
  const price0 = useRecoilValue(configState).price0;
  const {price, prevPrice} = useRecoilValue(fetchQuote)
  const priceDiff = (prevPrice ? Math.round((price - prevPrice + Number.EPSILON) * 100) / 100 : 0);

  const TitleBar = () => {
    return (
      <div className="titleContainer" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', gridGap: 5}}>
        <h1 className="tickerName">USD/MRS</h1>
        <Ticker type='bold' curr={price} diff={priceDiff}/>,
      </div>
    );
  };

  const StockChart = () => {
    const config = useRecoilValue(configState);
    // const {labels_http, quotes_http} = useRecoilValue(fetchQuoteSlice);
    const {labels, quotes} = useRecoilValue(fetchQuoteSlice);
    
    // const [labels, setLabels] = useState([])
    // const [quotes, setQuotes] = useState([])

    
    const chartMeta = {
      labels: labels,
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,
          data: quotes,
        },
      ],
      lineColor: 'black',
    };
  
    return (
      <div className='stockPlot'>
        <Line
          id='stock-plot'
          data={chartMeta}
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
                    value: config.price0,
                    borderColor: chartMeta.lineColor,
                    borderWidth: 1,
                    borderDash: [10, 5],
                  },
                  {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: config.T1,
                    borderColor: 'purple',
                    borderWidth: 3,
                    label: {backgroundColor: 'white', enabled:true, fontColor: 'purple', content:'Trade 1'},
                  },
                  {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: config.T2,
                    borderColor: 'purple',
                    borderWidth: 3,
                    label: {backgroundColor: 'white', enabled: true, fontColor: 'purple', content:'Trade 2'},
                  },
                  ],
              },
            }}
        />
      </div>
    );
  };

  return (
    <div className="priceTracker">
      <TitleBar />
      <span style={{display: 'grid'}}>
        <StockChart />
        <span className='deltaOverlay'>
          <Ticker type='percent' curr={price} diff={price - price0}/>
        </span>
      </span>
    </div>
  );
};


const TradeCenter = ({isWalkthrough}) => {
  const [expPause, setExpPause] = useRecoilState(expPauseState);

  const StatusMessage = () => 
    <h2 id='status-message'>
      {(expPause ? 'Enter a trade' : 'Observe the market')}
    </h2>;


  const TradingPanel = () => {
    const [qty, setQty] = useState(0);
    const [{buy, sell}, setBuySell] = useRecoilState(buySellState);
    const [cash, setCash] = useRecoilState(cashState);
    const [stock, setStock] = useRecoilState(stockState);
    const {currentPrice, prevPrice} = useRecoilValue(fetchQuote)
    const maxQty = useRecoilState(selectMaxQty);

    const maxQtyStatus = () => (
      buy || sell ?
      'Stocks available for  ' + (sell ? 'sale' : 'purchase') + ': ' + maxQty :
      ''
    );

    const yourTradeStatus = () => {
      const action = buy ? 'Buy ': (sell ? 'Sell ' : null);
      const status = action !== null ? action + qty + ' stocks' : '-';
      return (expPause ? "Your trade: " + status : '');
    };

    const handleSubmit = () => {
      const nextCash = stats.precisionRound((
        buy ? cash - (qty * currentPrice) :  cash + (qty * currentPrice)), 
        2);
      const nextStock = (buy ? stock + qty :  stock - qty);
      setCash(nextCash);
      setStock(nextStock);
      setBuySell({buy:false, sell: false});
      setExpPause(false);
    };

    const ValidatedInput = () => {
      return (
        <div className='inputBox'>
          <label htmlFor='in'>No. of Stocks: </label>
          <input
            type='number'
            placeholder={0}
            min={0}
            max={maxQty}
            onChange={(e) => {setQty(parseInt(e.target.value));}}
            disabled={!expPause}
            onKeyDown={(e) => {e.preventDefault();}}
          />
        </div>
      );
    };

    const BuySellB = () => {
      const handleClickBuy = () => {
        setBuySell({buy: !buy, sell: false});
      };
    
      const handleClickSell = () => {
        setBuySell({buy: false, sell: !sell});
      };

      const buyClass = buy ? 'btn buy_active' : 'btn buy';
      const sellClass = sell ? 'btn sell_active' : 'btn sell';
      return (
        <div id='buy-sell-btns' style={{marginBottom: '20px'}}>
          <button className={buyClass} onClick={handleClickBuy}>BUY</button>
          <button className={sellClass} onClick={handleClickSell}>SELL</button>
        </div>
      );
    }

    return (
      <div style={{alignSelf: 'center'}}>
        {maxQtyStatus}
        <fieldset className="panel">
          <div className="content" style={{marginTop: '10px'}}>
            <div className="input" style={{marginBottom: '30px'}}>
              <BuySellB />
              <ValidatedInput />
            </div>
            {yourTradeStatus}
            <button className="btn submit" disabled={!expPause} onClick={handleSubmit}>SUBMIT</button>
          </div>
        </fieldset>
      </div>
    );
  };

  const StatusTable = () => {
    const {currentPrice, prevPrice} = useRecoilValue(fetchQuote)
    const stock = useRecoilValue(stockState);
    const cash = useRecoilValue(cashState);
    const cashRound = Math.round(cash*100)/100;
    const initCash = useRecoilValue(configState).initCash;

    const getPF = () => {
      const currPF = stats.precisionRound(stock * currentPrice, 2) + cash;
      const prevPF = stats.precisionRound(stock * prevPrice, 2) + initCash;
      const priceDiff = (
        prevPrice ? 
        Math.round((currPF - prevPF + Number.EPSILON) * 100) / 100 : 
        0);
      return <Ticker type='lite' curr={currPF} diff={priceDiff}/>;
    };
    
    return (
      <table className="grayTable">
        <tbody>
          <tr>
            <th>Cash</th>
            <td>${cashRound}</td>
          </tr>
          <tr>
            <th>Stocks Held</th>
            <td>{stock}</td>
          </tr>
          <tr>
            <th>Net Worth/P&L</th>
            <td>{getPF()}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div style={isWalkthrough ? {pointerEvents: "none"} : {display: 'grid', gridTemplateRows: '1fr 4fr 3fr 2fr'}}>
      <Suspense fallback={<div>Loading...</div>}>
      <StatusMessage />
      <TradingPanel />
        <StatusTable />
      </Suspense>
    </div>
  );
};



