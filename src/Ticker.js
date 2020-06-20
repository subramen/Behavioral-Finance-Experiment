import React from 'react';
import './App.css';


export default function Ticker(props) {
    const {type, curr, diff} = props;
    const pc = Math.round((diff/curr*100 + Number.EPSILON)*100/100);
    const color = (diff < 0 ? 'red' : 'green')


    const liteOut = (
        <span className="Ticker" style={{color:color}}>
            <span style={{justifySelf: "end"}}>${curr}</span>
            <span className={"triangle " + (diff < 0 ? "down" : "up")}/> 
            <span style={{justifySelf: "start"}}>{diff}</span>
        </span>
    );

    const boldOut = (
        <span className="Ticker" style={{color:color}}>
            <h2 style={{justifySelf: "end"}}>{curr}</h2>
            <span className={"triangle " + (diff < 0 ? "down" : "up")}/> 
            <h2 style={{justifySelf: "start"}}>{diff}</h2>
        </span>
    );

    const pcOut = (
        <span className="Ticker" style={{color:color}}>
            <span className={"triangle " + (diff < 0 ? "down" : "up")}/> 
            <span style={{fontSize:"1.5em", fontWeight:"bold", justifySelf: "start"}}>{pc}%</span>
        </span>
    );

    if (type === 'bold') {
        return boldOut;
    }
    else if (type === 'lite') {
        return liteOut;
    }
    else if (type === 'percent')
    return pcOut;
  }
  