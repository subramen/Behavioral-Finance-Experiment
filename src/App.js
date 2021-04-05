import React, { useEffect, useState, useRef } from 'react';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useRecoilValueLoadable,
  } from 'recoil';
import Ticker from './Ticker'
import { stats } from './stats'
import Countdown from './components/timer'
import Joyride from 'react-joyride';
import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import './App.css';



const API_URL = 'http://localhost:5000';

const WC = true
const WC_DURATION = 0.25 * 60;
const TIME_TO_TRADE = 20;

const T1 = 10
const WC_on = T1 + TIME_TO_TRADE
const WC_off = WC_on + WC_DURATION
const T2 = WC_off + 5
const TN = T2 + 30 

const initCash = 1000
const initStock = 10

const tsToTimeStr = (d) => {
  const padTime = (x) => x.toString().padStart(2, "0");
  return padTime(d.getHours()) + ":" + padTime(d.getMinutes()) + ":" + padTime(d.getSeconds());
}


///////////////////////
// RECOIL ATOMS/SELECTORS
///////////////////////

const amznIDState = atom({
  key: 'amznID',
  default: '',
});

const expStartTimeState = atom({
  key: 'expStartTS',
  default: null,
})

const nowIdxState = atom({
    key: 'nowIdxState', 
    default: 0, 
});


const price0 = atom({
  key: 'price0',
  default: 0
})

const fetchSingleQuote = selector({
  key: 'fetchSingleQuote',
  get: async ({get}) => {
    get(nowIdxState);
    const response = await fetch(API_URL + '/get').then(data => data.json());
    return response;
  },
});

const dataList = atom({
  key: 'dataList',
  default: {
    "labels": [],
    "quotes": [],
    "timestamps": []
  },
});




const selectDataList = selector({
  key: 'selectData',
  get: ({get}) => {
    return get(dataList);
  },
  set: ({get, set}, [currentTS, currentPrice]) => {
    if (currentTS && currentPrice) {
      const {labels, quotes, timestamps} = get(dataList);
      const p0 = get(price0);
      const currentLabel = tsToTimeStr(new Date(currentTS * 1000));

      const newObj = {
        "labels": [...labels, currentLabel], 
        "quotes": [...quotes, currentPrice], 
        "timestamps": [...timestamps, currentTS]
      }; 

      if (!p0) set(price0, currentPrice);
      set(dataList, newObj);
    }
  }
})


// State atoms 
const cashState = atom({
  key:'cashState',
  default: 1000,
});

const stockState = atom({
  key:'stockState',
  default: 10,
});

const getWinnings = selector({
  key: 'getWinnings',
  get: ({get}) => {
    const {quotes} = get(dataList);
    if (quotes) { 
      const p0 = get(price0);
      const stock = get(stockState);
      const cash = get(cashState);
      const pNow = quotes[quotes.length - 1];
      const pf0 = stats.precisionRound(initStock * p0, 2) + initCash
      const pfNow = stats.precisionRound(stock * pNow, 2) + cash
      return pfNow - pf0
    }
    else {
      return null;
    }
  }
});

const buySellState = atom({
  key: 'buySellState',
  default: {
    buy: false,
    sell: false,
  }
});

const inputQty = atom({
  key: 'inputQtyState',
  default: 0,
});

const RNGState = atom({
  key: 'rng',
  default: 0
});


const isTimeToTrade2 = selector({
  key: 'isTimeToTrade2',
  get: ({get}) => {
    const nowIdx = get(nowIdxState);
    return {t1: (T1 <= nowIdx && nowIdx < T1 + TIME_TO_TRADE),
            t2: (T2 <= nowIdx && nowIdx < T2 + TIME_TO_TRADE)};
  }
});


const isTimeToTrade = selector({
  key: 'isTimeToTrade',
  get: ({get}) => {
    const nowIdx = get(nowIdxState);
    const val = ((T1 <= nowIdx && nowIdx < WC_on) 
        || (T2 <= nowIdx && nowIdx < T2 + TIME_TO_TRADE));
    return val;
  }
});



export default function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <Main />
      </div>
    </RecoilRoot>
  );
}


const Walkthrough = () => {
  const walkthroughSteps = [
    {
      target: '.App-container',
      title: 'Welcome!',
      content: <p>In this experiment, you will be trading a randomly-chosen major currency pair on the Forex spot market.<br/><br/>
      Take advantage of the volatile market to make maximum profit!</p>,
      event: 'hover',
      placement: 'center'
    },
    {
      target: '.stock-plot',
      title: 'Price Graph',
      content: "Track the stock's price here",
      event: 'hover',
      offset: 0,
    },
    // {
    //   target: '#percent-tick',
    //   content: 'Indicates the % change from the initial exchange rate.',
    //   event: 'hover',
    //   offset: 0,
    // },
    {
      target: '#msg',
      title: 'Trading Window Status',
      content: <p>You may place trades only when the window is open.<br/><br/>The trading window will open twice during the experiment.</p>,
      event: 'hover',
      placement: 'auto'
    },
    {
      target: '#trade-fieldset',
      title: 'Trading Panel',
      content: 'Place your trades here. Click Next to learn how...',
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
      content: 'Enter the number of stocks you want to trade (0 or more)...',
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
      target: '.status-table',
      title: 'Assets',
      content: 'Track your assets here. Click Next to learn more...',
      event: 'hover',
      placement: 'auto'
    },
    {
      target: '.status-cash',
      title: 'Available Cash',
      content: 'You start with $1000. Buying stock will reduce available cash. Selling stock will increase it.',
      event: 'hover',
      placement: 'auto'
    },
    {
      target: '.status-stock',
      title: 'Available Stock',
      content: 'You start with 10 stocks. Buy more if you think the stock will go up. Sell if you think it will go down.',
      event: 'hover',
      placement: 'auto'
    },
    {
      target: '.status-pnl',
      title: 'Profit/Loss',
      content: 'Track your net worth and profit/loss here. At the end of the experiment you want your net worth to be more than when you started!',
      event: 'hover',
      placement: 'auto'
    },
    {
      target: '.start-exp',
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

const IntroModal = ({setAMZN}) => {
  const [showIntro, setShowIntro] = useState(true);
  const amznRef = useRef();
  
  const onClick = () => {
    setAMZN(amznRef.current);
    setShowIntro(false);
    // db hit
  }

  const introModal = (
    <div className="modal-backdrop">
        <div className="modal-content" id="intro">
            <h1>Welcome!</h1>
            <div style={{textAlign:'left'}}>
              <h2>Instructions</h2>
              <p>This experiment attempts to study behaviors while trading
              in the stock market. Please ensure you are undisturbed for the next N minutes, and trade 
              seriously! If you make a profit, you stand to earn an additional bonus matching your profit.
              At the end of the experiment, you will have a short questionnaire about your experience. </p>
            </div>
            <div style={{textAlign: 'left'}}>
              <h2> Experiment Steps </h2>
              <ul>
                <li>The experiment will start with a walkthrough of the trading interface.</li>
                <li>Initially, trading will be closed. Use this time to observe the market.</li>
                <li>During the experiment, there will be 2 trading windows where you can place your trades.
                  Each trading window will be open only for 15 seconds. </li>
                <li>You may be asked to take a break in the middle of the experiment - please do! 
                  This is important for the experiment.</li>
              </ul>
            </div>
            <span>
              <p>To start, enter your Amazon MTurk ID:</p>
              <input type="text" placeholder="AMT ID" onChange={(e) => { amznRef.current = e.target.value }}/>
            </span>
            <div>
              <button className="btn" onClick={onClick} px="45px" variant="contained" color="primary">Go</button>
            </div>
        </div>
      </div>
  );

  return (showIntro ? introModal : null);
}


const WCModal = ({nowIdx}) => {
  const expStartTS = useRecoilValue(expStartTimeState)
  const showWC = (WC && WC_on <= nowIdx && nowIdx < WC_off);
  const wc_break = WC_off - WC_on;
  const watercoolerModal = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div>
          <h1>Water Break - Take a {wc_break/60} minute break from the market</h1>
          <h2>Hydrate, check your notifications or simply close your eyes and focus on your breath.</h2>
          <h2>The market will resume after {wc_break/60} minutes, so be sure to be back!</h2>
          <Countdown then={expStartTS + WC_off*1000}/> 
          <br />
          <h3>For the control group, the experiment continues undisturbed.</h3>
        </div>
        <div className="footer" />
      </div>
    </div>
  );
  return (showWC ? watercoolerModal : null);
};

const OutroModal = ({nowIdx, setExpPause}) => {
  const endExp = (nowIdx === TN);
  const winnings = useRecoilValue(getWinnings);
  const setRNG = useSetRecoilState(RNGState);
  let rng = 0;
  let endModal = null;
  
  if (endExp) {
    rng = 12345;
    setRNG(rng);
    // setExpPause(true);

    // db hit

    endModal = (
      <div className="modal-backdrop">
        <div className="modal-content">
            <h1>Experiment complete!</h1>
            <div style={{textAlign: 'left'}}>
              <p>Thank you for participating! Your winnings today are ${winnings}. 
              If you are selected as a winner, we will reach out.
              </p>
            </div>
            <div style={{textAlign: 'left'}}>
              <p> Make a note of your unique ID: {rng}</p>
              <p>Enter this carefully in Amazon MTurk to receive your compensation.</p>
            </div>
        </div>
      </div>
    );
  }

  return endModal;
}


const Modal = ({setAMZN, setExpPause}) => {
  const nowIdx = useRecoilValue(nowIdxState);
  return (
    <>
      <IntroModal setAMZN={setAMZN} />
      <WCModal nowIdx={nowIdx} />
      <OutroModal nowIdx={nowIdx} setExpPause={setExpPause}/>
    </>
  );
}


const StateManager = ({expPause}) => {
  const [nowIdx, setNowIdx] = useRecoilState(nowIdxState);
  
  useEffect(() => {
      // increment `nowIdx` by 5 every 5s 
      const interval = setInterval(() => {
          if (nowIdx < TN && !expPause) setNowIdx(nowIdx + 5);            
      }, 5000);

      return () => clearInterval(interval);
  });
  return ( <div /> );
};


const Main = () => {
  const [expPause, setExpPause] = useState(true);
  const setExpStartTime = useSetRecoilState(expStartTimeState);
  const [amznID, setAMZN] = useRecoilState(amznIDState)

  return (
    <div className="App-container">
      <Modal setAMZN={setAMZN} setExpPause={setExpPause}/>
      {amznID !== '' ? <Walkthrough /> : null}
      <MarketScreen expPause={expPause} setExpPause={setExpPause} setExpStartTime={setExpStartTime}/>
      <StateManager expPause={expPause}/>
    </div>
  );
}


const MarketScreen = ({expPause, setExpPause, setExpStartTime}) => {
  const quoteLoadable= useRecoilValueLoadable(fetchSingleQuote);
  const updateDataList = useSetRecoilState(selectDataList);
  const [prevCurr, setPrevCurr] = useState({});
  const isTradeTime = useRecoilValue(isTimeToTrade);

  useEffect(() => {
    if (quoteLoadable.state === 'hasValue' && !expPause) {
      const {prev, curr} = quoteLoadable.contents;
      const prevcurr = {
        "currentTS": curr[0],
        "prevTS": prev[0],
        "currentPrice": curr[1],
        "prevPrice": prev[1]
      }
      setPrevCurr(prevcurr);
    }
  }, [quoteLoadable, expPause]);  

  useEffect(() => updateDataList([prevCurr["currentTS"], prevCurr["currentPrice"]]), [prevCurr]);

  const handleStart = () => {
    setExpPause(false); 
    setExpStartTime(Date.now());
    // db hit: exp start time, snapshot
  };

  return (
    <>
      <StockDisplay prevCurr={prevCurr} />
      <StatusMessage isTradeTime={isTradeTime}/>
      <StatusCountdown isTradeTime={isTradeTime} />
      <TradingPanel isTradeTime={isTradeTime} prevCurr={prevCurr}/>
      <StatusTable prevCurr={prevCurr} expPause={expPause}/>
      
      <div className="start-exp">
        <button 
          className="btn" 
          onClick={handleStart}
          disabled={!expPause}>Start
        </button>
      </div>
    </>
  );
};


const StockDisplay = ({prevCurr: {currentTS, currentPrice, prevPrice}} ) => {
  const priceDiff = (prevPrice ? Math.round((currentPrice - prevPrice + Number.EPSILON) * 100) / 100 : 0);

  const TitleBar = () => {
    return (
      <div className="title-container">
        <h1 className="ticker-name">TSLA</h1>
        <Ticker type='bold' curr={currentPrice} diff={priceDiff}/>
      </div>
    );
  };

  const StockChart = () => {
    const {labels, quotes} = useRecoilValue(selectDataList);
    const p0 = useRecoilValue(price0)
  
    const chartMeta = {
      labels: [...labels],
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,
          data: [...quotes],
        },
      ],
      lineColor: 'black',
    };
  
    return (
      <div className='stock-plot'>
        <Line
          id='stock-plot-line'
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
                    value: p0,
                    borderColor: chartMeta.lineColor,
                    borderWidth: 1,
                    borderDash: [10, 5],
                  },
                  {
                    type: 'line',
                    scaleID: 'x-axis-0',
                    value: T1 / 5,
                    borderColor: 'purple',
                    borderWidth: 3,
                    label: {backgroundColor: 'white', enabled:true, fontColor: 'purple', content:'Trade Window 1'},
                  },
                  {
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    // yScaleID: 'y-axis-0',
                    xMin: T1 / 5,
                    xMax: (T1 + TIME_TO_TRADE) / 5,
                    backgroundColor: 'rgba(255, 99, 132, 0.25)'
                  },
                  {
                    type: 'line',
                    scaleID: 'x-axis-0',
                    value: T2 / 5,
                    borderColor: 'purple',
                    borderWidth: 3,
                    label: {backgroundColor: 'white', enabled:true, fontColor: 'purple', content:'Trade Window 2'},
                  },
                  {
                    type: 'box',
                    xScaleID: 'x-axis-0',
                    xMin: T2 / 5,
                    xMax: (T2 + TIME_TO_TRADE) / 5,
                    backgroundColor: 'rgba(255, 99, 132, 0.25)'
                  },
                  ],
              },
            }}
        />
      </div>
    );
  };
  return (
    <>
      <TitleBar />
      <StockChart />
    </>
  );
};


const StatusMessage = ({isTradeTime}) => { 
  const status = (isTradeTime ? 'OPEN' : 'CLOSED');
  return ( 
    <div className='status-msg'>
      <h2 id='msg'>Trading window: {status}</h2>
    </div> );
};

const StatusCountdown = () => { 
  const expStartTS = useRecoilValue(expStartTimeState);
  const {t1, t2} = useRecoilValue(isTimeToTrade2);
  let elt = null;

  if (t1) {
    elt = <div className="status-countdown"> <Countdown id='count' then = {expStartTS + (T1 + TIME_TO_TRADE + 2)*1000} /> </div>
  }
  else if (t2) {
    elt = <div className="status-countdown"> <Countdown id='count' then = {expStartTS + (T2 + TIME_TO_TRADE + 2)*1000} /> </div> // hacky bug fix (+2)
  }

  return elt;
};


const TradingPanel = ({isTradeTime, prevCurr: {currentPrice, prevPrice}}) => {
  const [qty, setQty] = useRecoilState(inputQty);
  const [{buy, sell}, setBuySell] = useRecoilState(buySellState);
  const [cash, setCash] = useRecoilState(cashState);
  const [stock, setStock] = useRecoilState(stockState);
  const maxQty = buy ? Math.floor(cash/currentPrice) : (sell ? stock : 0);
  
  const maxQtyStatus = 
    buy || sell ?
    'Stocks available for  ' + (sell ? 'sale' : 'purchase') + ': ' + maxQty :
    '';

  const yourTradeStatus = () => {
    let qty0 = Math.min(qty, maxQty);
    const action = buy ? 'Buy ': (sell ? 'Sell ' : null);
    const status = action !== null ? action + qty0 + ' stocks' : '-';
    return (isTradeTime ? "Your trade: " + status : '');
  };

  const handleSubmit = () => {
    let qty0 = Math.min(qty, maxQty);
    const nextCash = stats.precisionRound((
      buy ? cash - (qty0 * currentPrice) :  cash + (qty0 * currentPrice)), 
      2);
    const nextStock = (buy ? stock + qty0 :  stock - qty0);
    
    // db hit: current state, txn, next state

    setCash(nextCash);
    setStock(nextStock);
    setBuySell({buy:false, sell: false});
    setQty(0);
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

  const InputBox = () => {
    const handleChange = (newval) => setQty(newval);

    return (
    <div className='inputBox'>
      <label htmlFor='in'>No. of Stocks: </label>
      <input
        type='number'
        min={0}
        value={qty}
        onChange={(e) => handleChange(parseInt(e.target.value))}
        disabled={!isTradeTime}
        onKeyDown={(e) => {e.preventDefault();}}
      />
    </div>
  )};
  

  return (
    <div className="trading-panel">
      {maxQtyStatus}
      <fieldset id="trade-fieldset">
        <div className="content" style={{marginTop: '10px'}}>
          <div className="input" style={{marginBottom: '30px'}}>
            <BuySellB />
            {InputBox()}
          </div>
          {yourTradeStatus()}
          <button className="btn submit" disabled={!isTradeTime} onClick={handleSubmit}>SUBMIT</button>
        </div>
      </fieldset>
    </div>
  );
};

const StatusTable = ({prevCurr: {currentPrice, prevPrice}, expPause}) => {
  const stock = useRecoilValue(stockState);
  const cash = useRecoilValue(cashState);
  const cashRound = Math.round(cash*100)/100;

  const getPF = () => {
    const currPF = stats.precisionRound(stock * currentPrice, 2) + cash;
    const priceDiff = Math.round(((currentPrice - prevPrice) * stock + Number.EPSILON) * 100) / 100
    return <Ticker type='lite' curr={currPF} diff={priceDiff}/>;
  };
  
  return (
    <table className="status-table">
      <tbody>
        <tr className="status-cash">
          <th>Cash</th>
          <td>${cashRound}</td>
        </tr>
        <tr className="status-stock">
          <th>Stocks Held</th>
          <td>{stock}</td>
        </tr>
        <tr className="status-pnl">
          <th>Net Worth/P&L</th>
          <td>{getPF()}</td>
        </tr>
      </tbody>
    </table>
  );
};

