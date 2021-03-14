import React, { useEffect, useState, Suspense } from 'react';
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

const expStartTimeState = atom({
  key: 'expStartTS',
  default: Date.now(),
})
const intervalMultiplierState = atom({
  key: 'intervalMultiplierState',
  default: 5,
})
const nowIdxState = atom({
    key: 'nowIdxState', 
    default: 0, 
});

const configState =  selector({
  key: 'configState',
  get: ({get}) => {
    const intervalMultiplier = get(intervalMultiplierState);
    return {
      T1: 2 * intervalMultiplier,
      T2: 8 * intervalMultiplier,
      TN: 10 * intervalMultiplier,
      WC: false,
      price0: 0,
      initCash: 1000,
    };
  },
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


const isTimeToTrade = selector({
  key: 'isTimeToTrade',
  get: ({get}) => {
    const nowIdx = get(nowIdxState);
    const T1 = get(configState).T1;
    const T2 = get(configState).T2;
    const intervalMultiplier = get(intervalMultiplierState);
    // give them 15 secs to trade
    return ((T1 <= nowIdx && nowIdx < T1 + 3*intervalMultiplier) || (T2 <= nowIdx && nowIdx < T2 + 3*intervalMultiplier));
  }
});



export default function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <Experiment />
      </div>
    </RecoilRoot>
  );
}


const Experiment = () => {
  const [expPause, setExpPause] = useState(true);
  const setExpStartTime = useSetRecoilState(expStartTimeState);

  return (
    <div className="App-container">
      <Modal />
      <ExperimentInterface />
      <button id="start-exp" 
        className="btn" 
        onClick={() => {
          setExpPause(false); 
          setExpStartTime(Math.round(Date.now()/1000));
        }}
        disabled={!expPause}>Start
      </button>
      <StateManager expPause={expPause}/>
    </div>
  );
}


const StateManager = ({expPause}) => {
  const [nowIdx, setNowIdx] = useRecoilState(nowIdxState);
  const { TN } = useRecoilValue(configState)
  const intervalMultiplier = useRecoilValue(intervalMultiplierState);
  console.log("<statemanager> now", nowIdx, "exp pause", expPause);

  useEffect(() => {
      // increment `nowIdx` every intervalMultiplier s if market is unpaused
      const interval = setInterval(() => {
          if (nowIdx < TN) setNowIdx(nowIdx + intervalMultiplier);            
      }, intervalMultiplier * 1000);

      return () => clearInterval(interval);
  });

  return (
    <div />
  );
};



const Modal = () => {
  const nowIdx = useRecoilValue(nowIdxState);
  const intervalMultiplier = useRecoilValue(intervalMultiplierState);
  const {T1, T2, TN, WC } = useRecoilValue(configState)
  
  const showWC = (WC && T1 + 3*intervalMultiplier <= nowIdx && nowIdx < T2);
  const endExp = (nowIdx === TN);

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

  const endModal = (
    <div className="modal-backdrop">
      <div className="modal-content">
          <h1>Experiment over</h1>
      </div>
    </div>
  );
  
  return (showWC ? watercoolerModal : (endExp ? endModal : null));
};


const ExperimentInterface = () => {
  return (
    <div>
      <Walkthrough />
      <Suspense fallback={setTimeout(() => <div>Loading...</div>, 1500)}>
        <MarketScreen />
      </Suspense>
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


const MarketScreen = () => {
  const quoteLoadable= useRecoilValueLoadable(fetchSingleQuote);
  const updateDataList = useSetRecoilState(selectDataList);
  const [prevCurr, setPrevCurr] = useState({});
  
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
    <div className="market-screen">
      <StockDisplay prevCurr={prevCurr} />
      <TradeCenter prevCurr={prevCurr} />
    </div>
  );
};




const StockDisplay = ({prevCurr: {currentTS, currentPrice, prevPrice}} ) => {
  const price0 = useRecoilValue(configState).price0;
  const priceDiff = (prevPrice ? Math.round((currentPrice - prevPrice + Number.EPSILON) * 100) / 100 : 0);

  const TitleBar = () => {
    return (
      <div className="titleContainer" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', gridGap: 5}}>
        <h1 className="tickerName">USD/MRS</h1>
        <Ticker type='bold' curr={currentPrice} diff={priceDiff}/>
      </div>
    );
  };

  const StockChart = () => {
    const config = useRecoilValue(configState);
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
        <StockChart currentPrice={currentPrice} currentTS={currentTS}/>
        <span className='deltaOverlay'>
          <Ticker type='percent' curr={currentPrice} diff={currentPrice - price0}/>
        </span>
      </span>
    </div>
  );
};


const TradeCenter = ({prevCurr: {currentPrice, prevPrice}}) => { 
  const isTradeTime = useRecoilValue(isTimeToTrade);

  const StatusMessage = () => 
    <h2 id='status-message'>
      {(isTradeTime ? 'Trading window: OPEN' : 'Trading window: CLOSED')}
    </h2>;

  const TradingPanel = () => {
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
      <div style={{alignSelf: 'center'}}>
        {maxQtyStatus}
        <fieldset className="panel">
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

  const StatusTable = () => {
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
    <div style={{display: 'grid', gridTemplateRows: '1fr 4fr 3fr 2fr'}}>
      <StatusMessage />
      <TradingPanel />
      <StatusTable />
    </div>
  );
};