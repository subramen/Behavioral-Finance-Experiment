# -*- coding: utf-8 -*-
"""
Created on Sat Nov 23 14:03:42 2019

@author: suraj
"""
import config as cfg
import pandas as pd
import sqlite3
from dash.exceptions import PreventUpdate
import math
from plotly import graph_objs as go
import random

import os
import psycopg2
DATABASE_URL = os.environ['DATABASE_URL'] 



WINDOW_SIZE = 500
minutes_per_interval = 15  # CHANGE!
overall_price_multiplier = 6
volatile_price_multiplier = 2

end_P1 = 330//minutes_per_interval
end_P2 = 510//minutes_per_interval

df_start = 1000
df_end = 1650

MAX_LEN = df_end-df_start



# Returns:screen visibility flag
def start_exp(nclick1, dataend, mturk_id, surv1, surv2):
    nclick1 = nclick1 or 0
    if not (surv1 and surv2 and mturk_id):
        raise PreventUpdate

    elif dataend:
        d1 = {'display':'none'}
        d2 = {'display':'none'}
        d3 = {'display':'block'}
        return [d1,d2,d3]

    elif nclick1>1:
        d1 = {'display':'none'}
        d2 = {'display':'block'}
        d3 = {'display':'none'}
        return [d1, d2, d3]
    
    else:
        raise PreventUpdate




# WATERCOOLER
# @app.callback(Output('watercooler', 'data'), [Input("interval-component", "n_intervals")])
def watercooler_break(interval, app_name):
    global PRICE_DF
    if app_name=="app2" and end_P1+3<interval<end_P2:
        return True
    else:
        return False



def dist_stretcher(series, multiplier):
    meann = series.mean()
    return multiplier*(series-meann) + meann # X <- vpm*(x-mean) + mean


# Returns:Price dataset
def get_df():
    price_df = pd.read_csv('AAPL_1M_16.09.2019-20.09.2019.csv', parse_dates=['Localtime'])
    price_df = price_df[price_df.Volume>0]
    price_df=price_df.iloc[df_start:df_end]
    price_df.index = range(len(price_df))
    price_df['strtime'] = price_df.Localtime.dt.strftime("%m/%d %H:%M")
    price_df['index2'] = price_df.index//minutes_per_interval
    
    ix_p1 = end_P1*minutes_per_interval
    ix_p2 = end_P2*minutes_per_interval
    price_df.loc[ix_p1:ix_p2]['High'] = dist_stretcher(price_df.loc[ix_p1:ix_p2]['High'].copy(), volatile_price_multiplier)
    
    price_df['High']= dist_stretcher(price_df['High'].copy(), overall_price_multiplier)
    return price_df

PRICE_DF = get_df()



        
        
        
#@app.callback([Output("today_price-store", "data"), Output("today_dt-store","data"), \
#               Output('position-store','data'), Output('p&l-store','data'), Output('data-end', 'data')], 
#              [Input("interval-component", "n_intervals")], \
#              [State('stock-store','data'), State('stock-qty-1','data'), \
#               State('stock-qty-2','data'), State('txn-price-1','data'), State('txn-price-2','data'), State('data-end','data')])
def update_currents(interval, stock, x1, x2, cp1, cp2, dataend, cash):
    global PRICE_DF
    interval = interval or 0
    ix = interval*minutes_per_interval
    df=None
    if ix>MAX_LEN:
        dataend=True
        df = PRICE_DF.tail(1)
    else:
        df = PRICE_DF.iloc[ix]
    curr_price = round(float(df['High']), 2)
    curr_dt = df['strtime']
    stock = stock or 0
    curr_pos = round(stock*curr_price+cash, 2)
    cp1 = cp1 or 0
    cp2 = cp2 or 0
    x1 = x1 or 0
    x2 = x2 or 0
    curr_pnl = round((curr_price-cp1)*x1+(curr_price-cp2)*x2, 2)
    return curr_price, curr_dt, curr_pos, curr_pnl, dataend



# UPDATE DISPLAY STR
#@app.callback([Output("today_price-str", "children"), Output("today-str","children"), \
#               Output('cash-str','children'), Output('stock-str','children'), \
#               Output('position-str','children'), Output('p&l-str','children'), Output('p&l-str','style'), Output('position-str', 'style')], 
#              [Input("today_price-store", "data"), Input("today_dt-store","data"), Input("watercooler","data")],
#              [State("cash-store",'data'), State('stock-store','data'), \
#               State('position-store','data'), State('p&l-store','data')])
def update_today_str(price, date, wc, cash, stock, pos, pnl):
    if wc:
        raise PreventUpdate
    pnl = pnl or 0
    pos = pos or 0
    pnlstyle_dict = {'display':'block', 'color':'red'} if pnl<0 else {'display':'block', 'color':'green'}
    posstyle_dict = {'display':'block', 'color':'red'} if pos<cfg.status0['cash'] else {'display':'block', 'color':'green'}
    return f"Current Price: ${price}", f"{date}", f"${cash}", f"{stock}", f"${pos}", f"Unrealized P&L: ${pnl}", pnlstyle_dict, posstyle_dict








# PAUSE INTERVAL TO ASK FOR BID
# Disable interval timer, Enable submit button, Prompt for bid
#@app.callback([Output("interval-component", "disabled"), Output("submit", "disabled"),\
#               Output("ask-bid", "children")], 
#               [Input("interval-component", "n_intervals"), Input("bid_submitted1",'children'), \
#                Input("bid_submitted2",'children'), Input('user-begin', 'n_clicks'), Input('data-end', 'data'), Input("watercooler","data")],
#                [State("cash-store",'data'), State('today_price-store','data'), State('stock-store','data'),])
def toggle_interval_for_bid(interval, bid_submitted1, bid_submitted2, screen2, dataend, wc, cash, price, stock):
    global PRICE_DF
    interval = interval or 0
    ix = interval*minutes_per_interval
    if ix>MAX_LEN:
        return True, True, 'Thanks'
    elif wc: 
        return False, True, 'Trading paused due to high volume. Take a break to hydrate.'
    elif screen2['display']=='block':
        if  PRICE_DF.iloc[ix]['index2'] == end_P1:#, end_P2]:
            if not bid_submitted1: # PAUSE FOR BID SUBMIT
                # Disable interval timer, Enable submit button, Prompt for bid
                return True, False, f"Enter number of stocks to buy. Allowed values between 0 to {math.floor(cash/price)}"
            else: # BID SUBMITTED. UNPAUSE
                # Enable interval timer, Disable submit button, 
                return False, True, 'Bid Accepted'
        if PRICE_DF.iloc[ix]['index2'] == end_P2:
            if not bid_submitted2: # PAUSE FOR BID SUBMIT
                return True, False, f"Trading resumed, enter buy/sell. Max Buy: {math.floor(cash/price)}. Max Sell: {stock}"
            else: # BID SUBMITTED. UNPAUSE
                return False, True, 'Bid Accepted'
        return False, True, 'Not accepting bids. Please study the market carefully.'
    else:
        raise PreventUpdate   




def fast_forward_end(bid_submitted2):
    if bid_submitted2:
      return 1500
    else:
      raise PreventUpdate





def get_trade(n_clicks, stock_qty, buysell, curr_cash, curr_stock, today_price, interval, bidsubmitted1, bidsubmitted2, x1, x2, cp1, cp2):
    global PRICE_DF
    if not (stock_qty and buysell):     # Empty input
        raise PreventUpdate
    else:
        # VALIDATE INPUT
        if buysell==1 and stock_qty*today_price>curr_cash:     # Buy value cannot be more than current cash. Don't update
            raise PreventUpdate
        if buysell==-1 and stock_qty>curr_stock: # Sell stocks cannot be more than current stock. Don't update
            raise PreventUpdate
        else:
            curr_cash = curr_cash - stock_qty*today_price*buysell
            curr_stock = curr_stock or 0
            curr_stock = curr_stock + stock_qty*buysell
       
            # BID SUBMITTED TRUE
            if interval == end_P1 and not bidsubmitted1:
                bidsubmitted1 = True
                x1 = stock_qty #Sql
                cp1 = today_price #Sql
            if interval == end_P2 and not bidsubmitted2:
                bidsubmitted2 =True
                x2 = stock_qty*buysell
                cp2 = today_price if buysell>0 else cp1
            return round(curr_cash,2), curr_stock, bidsubmitted1, bidsubmitted2, x1, x2, cp1, cp2
    
    

def plot_prices(interval, wc):
    global PRICE_DF
    if wc:
        raise PreventUpdate
    
    ix = interval*minutes_per_interval
#    pre = max(0, ix-WINDOW_SIZE)
    pre = 0
    df = PRICE_DF[['strtime', 'High', 'Low']].iloc[pre:ix]
    # pad empty data points 
    null_df = pd.DataFrame(columns=['strtime','High','Low'])
    null_df['strtime'] = PRICE_DF['strtime'].iloc[ix:ix+3*(end_P2-end_P1)]
    
    df = pd.concat([df,null_df])

        
    fig={'data':[], 'layout':{}}
    
    trace_high = go.Scatter(
        x=df['strtime'],
        y=df['High'],
        name = "Stock High",
        line = dict(color = '#17BECF'),
        opacity = 0.8)
        
    trace_vline_list=[]
    
    if interval>=end_P1:
        row = PRICE_DF.iloc[end_P1*minutes_per_interval]
        trace_vline_list.append(go.layout.Shape(
                type="line",
                x0=row['strtime'],
                x1=row['strtime'],
                y0=row['High']-5,
                y1=row['High']+5,
                line=dict(color='Red', width=3, dash='dot')))

    fig['data'] = [trace_high]
    
    
    fig["layout"]["uirevision"] = "The User is always right"  # Ensures zoom on graph is the same on update
    fig["layout"]["margin"] = {"t": 10, "l": 50, "b": 40, "r": 25}
    fig["layout"]["autosize"] = True
    fig['layout']['xaxis'] = dict()
    fig["layout"]["xaxis"]["type"] = "category"
    fig["layout"]["xaxis"]["showticklabels"]=False
    fig["layout"]["xaxis"]["ticks"]="inside"
    fig["layout"]["xaxis"]["tickangle"]=45
    fig["layout"]["xaxis"]["dtick"]=6
    fig["layout"]["xaxis"]["tickfont"]={'size':10}
    fig["layout"]["yaxis"] = dict()
    fig["layout"]["yaxis"]["showgrid"] = True
    fig["layout"]["yaxis"]["gridcolor"] = "#3E3F40"
    fig["layout"]["yaxis"]["gridwidth"] = 1
    fig["layout"]['paper_bgcolor'] = cfg.app_color["graph_bg"]
    fig["layout"]['plot_bgcolor'] =cfg.app_color["graph_bg"]
    fig["layout"]['font'] = {"color": "#fff"}
    fig['layout']['shapes'] = trace_vline_list
    
    return fig


def end_experiment(exp_end, x1, x2, p1, p2, curr_pos, mturk, s1, s2, s3, s4, s5, app_name):
    if exp_end is None:
        raise PreventUpdate
    if not mturk:
        raise PreventUpdate
    
    win_style = {'text-align':'center'}
    say_thanks = {'display':'inline-block', 'text-align':'center'}

    win_str=""
    netwin=round(curr_pos-cfg.status0['cash'],2)
    if netwin>0:
        win_str = f"You made a profit of ${netwin}. If you are a selected winner, we will be in touch."
        win_style['color']='Green'
    else:
        win_str = f"You made a loss of ${netwin}. If you are a selected winner, we will be in touch."
        win_style['color'] = 'Red'

    rng = ''.join(random.choice('0123456789ABCDEF') for i in range(12))
    
    persist_to_sql(app_name, mturk, x1, x2, p1, p2, netwin, s1, s2, s3, s4, s5)

    return(win_str, "Thank you. You may now close this window.", win_style, f"Enter this ID exactly on MTurk to recieve your compensation: {rng}", say_thanks)
    

def persist_to_sql(app_name, mturk, x1, x2, p1, p2, netwin, s1, s2, s3, s4, s5):
    # CREATE TABLE results (exp_id TEXT, mturk_id TEXT, qty1 NUMERIC, price1 NUMERIC, qty2 NUMERIC, price2 NUMERIC, \
    # winnings NUMERIC, sq1 NUMERIC, sq2 NUMERIC, sq3 NUMERIC, sq4 NUMERIC, sq5 NUMERIC, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    cur = conn.cursor()
    sql = "INSERT INTO results VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,DEFAULT)"
    cur.execute(sql, (app_name, mturk, x1, x2, p1, p2, netwin, s1, s2, s3, s4, s5))
    conn.commit()
    cur.close()
    conn.close()
