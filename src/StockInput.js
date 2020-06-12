function StockInput(props) {
    return (
      <div className='inputBox'>
        <label htmlFor='in'>No. of Stocks: </label>
        <input className='in' type='number' placeholder='0' min='0' onChange={props.handleInputChange}></input>
      </div>
    );
  }