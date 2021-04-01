import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
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
import './App.css';



const API_URL = 'http://localhost:5000';

const WC = true
const TIME_TO_TRADE = 15;

const T1 = 10
const WC_on = T1 + TIME_TO_TRADE
const WC_off = WC_on + 3 * 60
const T2 = WC_off + 20
const TN = T2 + 60 
const price0 = 0
const initCash = 1000





const expStartTimeState = atom({
  key: 'expStartTS',
  default: Date.now(),
})

const nowIdxState = atom({
    key: 'nowIdxState', 
    default: 0, 
});

const amznIDState = atom({
  key: 'amznID',
  default: '',
});




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
    "quotes": []
  },
});

const selectDataList = selector({
  key: 'selectData',
  get: ({get}) => {
    return get(dataList);
  },
  set: ({get, set}, [currentTS, currentPrice]) => {
    if (currentTS && currentPrice) {
      const {labels, quotes} = get(dataList);
      const newObj = {"labels": [...labels, currentTS], "quotes": [...quotes, currentPrice]}; 
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
})


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
    if(val) console.log("time to trade", nowIdx);
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


const Intro = ({setAMZN}) => {
  const [showIntro, setShowIntro] = useState(true);
  const amznRef = useRef();
  
  const onClick = () => {
    setAMZN(amznRef.current);
    setShowIntro(false);
  }

  return (
    ( showIntro ? 
      <div className="modal-backdrop">
        <div className="modal-content">
            <h1>Welcome!</h1>
            <p>Some instructions here...</p>
            <span>
              <p>Get their details here...</p>
              <input type="text" placeholder="AMT ID" onChange={(e) => { amznRef.current = e.target.value }}/>
            </span>
            <div>
              <button className="btn" onClick={onClick} px="45px" variant="contained" color="primary">Go</button>
            </div>
        </div>
      </div>
      : 
      null)
  );
}


// TODO: fix targets
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
      target: '.status-table',
      title: 'Assets',
      content: <p>Here you can see your current holdings, net worth (cash + stock), and your Profit/Loss since the start of the experiment.<br/><br/>You will start with $1000 and 10 units of the currency.</p>,
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


const Modal = () => {
  const nowIdx = useRecoilValue(nowIdxState);
  const expStartTS = useRecoilValue(expStartTimeState)
  
  const showWC = (WC && WC_on <= nowIdx && nowIdx < WC_off);
  const endExp = (nowIdx === TN);
  const wc_break = WC_off - WC_on;
  if(showWC) console.log(nowIdx, WC_off);

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

  const endModal = (
    <div className="modal-backdrop">
      <div className="modal-content">
          <h1>Experiment over</h1>
      </div>
    </div>
  );
  
  return (showWC ? watercoolerModal : (endExp ? endModal : null));
};


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

  const display = (amznID !== '') 
    ? <>
      <Walkthrough />
      <MarketScreen expPause={expPause} setExpPause={setExpPause} setExpStartTime={setExpStartTime}/>
    </>
    : <Intro setAMZN={setAMZN}/>

  return (
    <div className="App-container">
      <Modal />
      {display}
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
    if (quoteLoadable.state === 'hasValue') {
      const {prev, curr} = quoteLoadable.contents;
      setPrevCurr({
        "currentTS": curr[0],
        "prevTS": prev[0],
        "currentPrice": curr[1],
        "prevPrice": prev[1]
      });
    }
  }, [quoteLoadable]);  

  useEffect(() => updateDataList([prevCurr["currentTS"], prevCurr["currentPrice"]]), [prevCurr]);

  
  return (
    <>
      <StockDisplay prevCurr={prevCurr} />
      <StatusMessage isTradeTime={isTradeTime}/>
      <StatusCountdown isTradeTime={isTradeTime} />
      <TradingPanel isTradeTime={isTradeTime} prevCurr={prevCurr}/>
      <StatusTable prevCurr={prevCurr}/>
      
      <div className="start-exp">
        <button 
          className="btn" 
          onClick={() => {
            setExpPause(false); 
            setExpStartTime(Date.now());
          }}
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
        <h1 className="ticker-name">USD/MRS</h1>
        <Ticker type='bold' curr={currentPrice} diff={priceDiff}/>
      </div>
    );
  };

  const StockChart = () => {
    const {labels, quotes} = useRecoilValue(selectDataList);
  
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
                    value: price0,
                    borderColor: chartMeta.lineColor,
                    borderWidth: 1,
                    borderDash: [10, 5],
                  },
                  {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: T1,
                    borderColor: 'purple',
                    borderWidth: 3,
                    label: {backgroundColor: 'white', enabled:true, fontColor: 'purple', content:'Trade 1'},
                  },
                  {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: T2,
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
      <fieldset >
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

const StatusTable = ({prevCurr: {currentPrice, prevPrice}}) => {
  const stock = useRecoilValue(stockState);
  const cash = useRecoilValue(cashState);
  const cashRound = Math.round(cash*100)/100;

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
    <table className="status-table">
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

