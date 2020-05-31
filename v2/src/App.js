import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "repeat(2, [row] auto)", gridGap: 20 }}>
          <div className="LeftCol">
            <TitleBar price="30"/>
            <StockPlot price="30" timestamp="23rd June"/>
          </div>
          <div className="RightCol">
            <StatusDisp cash="$30" portfolio="$30" stocks="10"/>
            <CtrlPanel />        
          </div>
        </div>
      </div>
    );
  }
}



class TitleBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {prevPrice:null}
    this.getTicker = this.getTicker.bind(this)
  }

  getTicker() {
    var out;
    if (this.state.prevPrice && this.props.price < this.state.prevPrice) {
      out = (
        <h1 style={{color:"red", display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gridGap: 0 }}>
          {this.props.price} 
          <span id="dn-triangle" /> 
          {this.state.prevPrice ? this.props.price - this.state.prevPrice : 0}
        </h1>
      );
    } 
    else {
      out = (
        <h1 style={{color:"green", display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gridGap: 0 }}>
          {this.props.price} 
          <span id="up-triangle" /> 
          {this.state.prevPrice ? this.props.price - this.state.prevPrice : 0}
        </h1>
      );
    }
    return out
  }

  componentDidUpdate() {
    if (this.state.prevPrice !== this.props.price) {
      this.setState(
        {prevPrice: this.props.price}
      );
    }
  }

  render() {
    return (
      <div className="titleContainer" style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gridGap: 5 }}>
        <h1 style={{textAlign: "left"}}>AAPL</h1>
        {this.getTicker()}
      </div>
    );
  }
}



class StockPlot extends React.Component {
  // receive global states in props (read-only)
  // push currPrice in this.state.data array

  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      datasets: [
        {
          // label: false,
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,
          data: []
        }
      ]
    };
    this.updateChart = this.updateChart.bind(this)
  }
  
  // TEST 
  componentDidMount() { 
    this.timerID = setInterval(
      () => this.updateChart(),
      1000
    );
  }
  
  updateChart() {
    var newDatasets = {...this.state.datasets[0]};
    newDatasets.data.push(this.props.price);

    this.setState(state => ({
      labels: [...this.state.labels, this.props.timestamp],
      datasets: [newDatasets]
    }));
  }

 
  render() {
    return (
      <div>
        <Line
          data={this.state}
          options={{
            title:{display:false},
            legend:{display:false}
          }}
          />
      </div>
);
  }
}



function StatusDisp(props) {
  return (
  <table>
    <tbody>
      <tr>
        <th>Cash</th>
        <td>{props.cash}</td>
      </tr>
      <tr>
        <th>Portfolio</th>
        <td>{props.portfolio}</td>
      </tr>
      <tr>
        <th>Stocks Held</th>
        <td>{props.stocks}</td>
      </tr>
    </tbody>
  </table>
  );
}





class CtrlPanel extends React.Component {
  render() {
    return (
      <h1>Placeholder for Control Panel</h1>
    )
  }
}












// class Clock extends React.Component {
//   constructor(props) { // #1
//     // Props is always passed to base constructor
//     super(props);
//     this.state = {date: new Date()};
//   }

  
//   // Runs after component output rendered on the DOM
//   componentDidMount() { // #3
//     this.timerID = setInterval(
//       () => this.tick(),
//       1000
//     );
//   }

//   tick() { // #4
//     this.setState(
//       {date: new Date()}
//       );
//   }

//   componentWillUnmount() {
//     return (<div><h1>Ummounted</h1></div>);
//   }

//   // Called whenever change in state
//   render() { // #2 #5
//     return (
//       <div>
//         <h1>Hello World!</h1>
//         <h3> The time is {this.state.date.toLocaleTimeString()} </h3>
//       </div>
//     );
//   }
// }

// ReactDOM.render(
//   <Clock />,
//   document.getElementById('root2')
// )





// class Toggle extends React.Component {
//   constructor(props) {
//     super(props);
//     // This binding is necessary to make `this` work in the callback
//     // In JavaScript, class methods are not bound by default
//     this.handleClick = this.handleClick.bind(this);
//     this.state = {isToggleOn: true};
//   }

  // handleClick() {
  //   this.setState(
  //     state => ({ // async update
  //     isToggleOn: !state.isToggleOn
  //     })
  //   );
  // }

//   render() {
//     return (
//       <button onClick={this.handleClick}>
//         {this.state.isToggleOn ? 'ON' : 'OFF'}
//       </button>
//     );
//   }
// }

// ReactDOM.render(
//   <Toggle />,
//   document.getElementById('root3')
// );





// function Blog(props) {
//   const sidebar = (
//     <ul>
//       {props.posts.map((post) =>
//         <li key={post.id}>
//           {post.title}
//         </li>
//       )}
//     </ul>
//   );
//   const content = props.posts.map((post) =>
//     <div key={post.id}>
//       <h3>{post.title}</h3>
//       <p>{post.content}</p>
//     </div>
//   );
//   return (
//     <div>
//       {sidebar}
//       <hr />
//       {content}
//     </div>
//   );
// }

// const posts = [
//   {id: 1, title: 'Hello World', content: 'Welcome to learning React!'},
//   {id: 2, title: 'Installation', content: 'You can install React from npm.'}
// ];
// ReactDOM.render(
//   <Blog posts={posts} />,
//   document.getElementById('root3')
// );






export default App;

