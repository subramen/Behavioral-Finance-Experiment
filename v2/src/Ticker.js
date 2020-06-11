import React from 'react';
import './App.css';


export default function Ticker(props) {
    const {bold, curr, diff} = props;
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

    if (bold) {
        return boldOut;
    }
    else {
        return liteOut;
    }
  }
  