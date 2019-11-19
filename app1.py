import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
import pandas as pd
from plotly import graph_objs as go
import math
import sqlite3

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = dash.Dash('app1', external_stylesheets=external_stylesheets)


price_df = pd.read_csv('AAPL_1M_16.09.2019-20.09.2019.csv', parse_dates=['Localtime'])
price_df = price_df[price_df.Volume>0]
price_df['strtime'] = price_df.Localtime.dt.strftime("%m/%d %H:%M")
price_df.index = range(len(price_df))
price_df['index2'] = price_df.index//3



MAX_LEN = len(price_df)-1
WINDOW_SIZE = 120
minutes_per_second = 3
end_P1 = 102
end_P2 = 408
status0 = {'cash':10000, 'stock':10, 'position':0} #defaults
app_color = {"graph_bg": "#082255", "graph_line": "#007ACE"}




             
screen1 = html.Div(id='screen1', style={'display':'block', 'float':'center'},\
                   children=[html.H3('To start, click Begin'), html.Br(), html.Button('Begin', id='user-begin')])

screen2 = html.Div(id='screen2',style={'display':'none'}, children = [
        # TITLE
        html.H3(children='Stock Market'),
        html.P("Hover mouse over graph to know more"),
        
        # INTERNAL VARIABLES
        dcc.Interval(id='interval-component',interval=1000, n_intervals=0, disabled=True),
        dcc.Store(id='today_price-store', data=200),
        dcc.Store(id='cash-store', data=status0['cash']),
        dcc.Store(id='stock-store', data=status0['stock']),
        dcc.Store(id='position-store', data=status0['position']),
        dcc.Store(id='p&l-store', data=status0['position']),
        dcc.Store(id='today_dt-store', data='16 Sep-09:30'),
        dcc.Store(id='orig-inv'),
        
        dcc.Store(id='stock-qty-1', data=0),
        dcc.Store(id='stock-qty-2', data=0),
        dcc.Store(id='txn-price-1', data=0),
        dcc.Store(id='txn-price-2', data=0),
        
        dcc.Store(id='data-end', data=False),
        
        html.Div(id='toprow', style={'width':'100%', 'overflow':'auto'}, children=[
                html.Div(dcc.Graph(id="price-graph"), style={'float':'left', 'width':'70%'}),
                html.Div([
                        html.Table([
                            html.Tr([html.Th(style={'display':'block'}, children=['Cash']), \
                                     html.Th(style={'display':'block'}, children=['Stocks Held']), \
                                     html.Th(style={'display':'block'}, children=['Current Position']), \
                                     html.Th(style={'display':'block'}, children=['Current P&L'])],
                                 style={'float':'left', 'display':'block'}),
                                     
                            html.Tr([html.Td(style={'display':'block'}, id='cash-str', children="${}".format(status0['cash'])), \
                                     html.Td(style={'display':'block'}, id='stock-str', children="0"), \
                                     html.Td(style={'display':'block'}, id='position-str', children="$0"), \
                                     html.Td(style={'display':'block'}, id='p&l-str', children="$0")],
                                 style={'float':'left', 'display':'block'})
                        ]),
                        html.Br(),html.Br(),
                        html.H3(id='today_price-str', children="Current Price: $200"),
                        html.H4(id='today-str', children="Today is 09/16 09:30", style={'color':'blue'})
                    ], style={'float':'right', 'padding':'30px'}) ,
                ]),
                
        html.Br(),
#        html.H3(id='today-str', children="Today is 16 Sep 09:30", style={'color':'blue', 'text-align':'center'}),
        html.H3(id='ask-bid', children=' ', style={'color':'red'}),
        html.Div(id='bid_submitted1', style={'display': 'none'}, children='no'),
        html.Div(id='bid_submitted2', style={'display': 'none'}, children='no'),
                

        # INPUTS
         html.Div(id='buy/sell', style={'float':'center', 'overflow':'auto', 'width':'30%'}, children=[
                 html.Div(dcc.Input(id="txn", type='number', placeholder='No. of Stocks', min=0), style={'float':'left'}),
                 dcc.RadioItems(id='buysell', options=[{'label':'BUY', 'value':1}, {'label':'SELL', 'value':-1}], value=1, style={'overflow':'auto'}),
                 html.Br(),
                 html.Button('Submit', id='submit', hidden=True),
                 html.Div(id='buy-sell-status')
        ])
])
                            
           
screen3 = html.Div(id='screen3', style={'display':'none', 'float':'center'},\
                   children=[html.H3('Enter your MTurk Worker ID to receive compensation'), html.Br(),\
                             dcc.Input(id='mturk-id', placeholder='Mturk Worker ID'), html.Button('End Task', id='exp-end'),\
                             html.H2(id='ty')])
                 

app.layout = html.Div([screen1, screen2, screen3])






# SCREEN CONTROL
@app.callback([Output('screen1','style'), Output('screen2','style'), Output('screen3', 'style')], \
               [Input('user-begin', 'n_clicks'), Input('data-end', 'data')])
def start_exp(nclick1, dataend):
    if dataend:
        d1 = {'display':'none'}
        d2 = {'display':'none'}
        d3 = {'display':'block'}
        return [d1,d2,d3]
    elif nclick1:
        d1 = {'display':'none', 'float':'center'}
        d2 = {'display':'block'}
        d3 = {'display':'none'}
        return [d1,d2, d3]
    else:
        raise PreventUpdate
    

# GET CURRENT PRICE AND DATE
@app.callback([Output("today_price-store", "data"), Output("today_dt-store","data"), \
               Output('position-store','data'), Output('p&l-store','data'), Output('data-end', 'data')], 
              [Input("interval-component", "n_intervals")], \
              [State('stock-store','data'), State('stock-qty-1','data'), \
               State('stock-qty-2','data'), State('txn-price-1','data'), State('txn-price-2','data'), State('data-end','data')])
def update_currents(interval, stock, x1, x2, cp1, cp2, dataend):
    interval = interval or 0
    ix = interval*minutes_per_second
    if ix>MAX_LEN:
        ix-=minutes_per_second
#        dataend = True
        return 0, 0, 0, 0, True
    df = price_df.iloc[ix]
    curr_price = round(float(df['High']), 2)
    curr_dt = df['strtime']
    stock = stock or 0
    curr_pos = round(stock*curr_price, 2)
    cp1 = cp1 or 0
    cp2 = cp2 or 0
    x1 = x1 or 0
    x2 = x2 or 0
    curr_pnl = round((curr_price-cp1)*x1+(curr_price-cp2)*x2, 2)
    return curr_price, curr_dt, curr_pos, curr_pnl, dataend


# UPDATE DISPLAY STR
@app.callback([Output("today_price-str", "children"), Output("today-str","children"), \
               Output('cash-str','children'), Output('stock-str','children'), \
               Output('position-str','children'), Output('p&l-str','children'), Output('p&l-str','style')], 
              [Input("today_price-store", "data"), Input("today_dt-store","data")],
              [State("cash-store",'data'), State('stock-store','data'), \
               State('position-store','data'), State('p&l-store','data')])
def update_today_str(price, date, cash, stock, pos, pnl):
    pnl = pnl or 0
    if pnl<0:
        return f"Current Price: ${price}", f"Today is {date}", f"${cash}", \
            f"{stock}", f"${pos}", f"${pnl}", {'display':'block', 'color':'red'}
    else:
        return f"Current Price: ${price}", f"Today is {date}", f"${cash}", \
            f"{stock}", f"${pos}", f"${pnl}", {'display':'block', 'color':'green'}


    
    
# PAUSE INTERVAL TO ASK FOR BID
# Disable interval timer, Enable submit button, Prompt for bid
@app.callback([Output("interval-component", "disabled"), Output("submit", "disabled"),\
               Output("ask-bid", "children")], 
               [Input("interval-component", "n_intervals"), Input("bid_submitted1",'children'), \
                Input("bid_submitted2",'children'), Input('user-begin', 'n_clicks'), Input('data-end', 'data')],
                [State("cash-store",'data'), State('today_price-store','data'), State('stock-store','data'),])
def toggle_interval_for_bid(interval, bid_submitted1, bid_submitted2, begin_click, dataend, cash, price, stock):
    interval = interval or 0
    ix = interval*minutes_per_second
    if ix>MAX_LEN:
        return True, True, 'Thanks'
    elif begin_click:
        if price_df.iloc[ix]['index2'] == end_P1:#, end_P2]:
            if bid_submitted1=='no': # PAUSE
                return True, False, f"Enter number of stocks to buy. Allowed values between 0 to {math.floor(cash/price)}"
            else: #UNPAUSE
                return False, True, 'Bid Accepted'
        if price_df.iloc[ix]['index2'] == end_P2:
            if bid_submitted2=='no': # PAUSE
                return True, False, f"Enter number of stocks to buy/sell. Max Buy: {math.floor(cash/price)}. Max Sell: {stock}"
            else: #UNPAUSE
                return False, True, 'Bid Accepted'
        return False, True, 'Currently not accepting bids'
    else:
        raise PreventUpdate   
    


# GET BID
@app.callback([Output("cash-store",'data'), Output('stock-store','data'), \
               Output('bid_submitted1','children'), Output('bid_submitted2','children'), \
               Output('stock-qty-1','data'), Output('stock-qty-2','data'),\
               Output('txn-price-1','data'), Output('txn-price-2','data')], 
    
              [Input("submit",'n_clicks')],
    
              [State('txn','value'), State('buysell','value'), State("cash-store",'data'), \
               State('stock-store','data'), State('today_price-store','data'), \
               State("interval-component", "n_intervals"), State('bid_submitted1','children'), \
               State('bid_submitted2','children'), State('stock-qty-1','data'), State('stock-qty-2','data'),\
               State('txn-price-1','data'), State('txn-price-2','data')]
          )
def get_trade(n_clicks, stock_qty, buysell, curr_cash, curr_stock, today_price, interval, b1, b2, x1, x2, cp1, cp2):
    if n_clicks is None:
        raise PreventUpdate
    if not stock_qty:
        raise PreventUpdate
    else:
        val = stock_qty*today_price
        if buysell==1 and val>curr_cash:
            raise PreventUpdate
        if buysell==-1 and stock_qty>curr_stock:
            raise PreventUpdate
        else:
            curr_cash = curr_cash - val*buysell
            curr_stock = curr_stock or 0
            curr_stock = curr_stock + stock_qty*buysell
       
            if price_df.iloc[interval*minutes_per_second]['index2'] == end_P1:
                b1 = 'yes'
                x1 = stock_qty
                cp1 = today_price
            if price_df.iloc[interval*minutes_per_second]['index2'] == end_P2:
                b2='yes'
                x2 = stock_qty*buysell
                cp2 = today_price if buysell>0 else cp1
            return round(curr_cash,2), curr_stock, b1, b2, x1, x2, cp1, cp2
        


# UPDATE GRAPH
@app.callback(
    Output("price-graph", "figure"), [Input("interval-component", "n_intervals")]
)
def plot_prices(interval):
    ix = interval*minutes_per_second
    pre = max(0, ix-WINDOW_SIZE)
    df = price_df.iloc[pre:ix]

        
    fig={'data':[], 'layout':{}}
    
    trace_high = go.Scatter(
        x=df.strtime,
        y=df['High'],
        name = "Stock High",
        line = dict(color = '#17BECF'),
        opacity = 0.8)
    
    trace_low = go.Scatter(
        x=df.strtime,
        y=df['Low'],
        name = "Stock Low",
        line = dict(color = '#7F7F7F'),
        opacity = 0.8)
    
    fig['data'] = [trace_high,trace_low]
    
    
    fig["layout"]["uirevision"] = "The User is always right"  # Ensures zoom on graph is the same on update
    fig["layout"]["margin"] = {"t": 10, "l": 50, "b": 70, "r": 25}
    fig["layout"]["autosize"] = True
#    fig["layout"]["height"] = 450
#    fig["layout"]["width"] = 800
    fig['layout']['xaxis'] = dict()
#    fig["layout"]["xaxis"]["tickformat"] = "%d %b %H:%M"
    fig["layout"]["xaxis"]["type"] = "category"
    fig["layout"]["xaxis"]["showticklabels"]=True
    fig["layout"]["xaxis"]["ticks"]="inside"
    fig["layout"]["xaxis"]["tickangle"]=45
    fig["layout"]["xaxis"]["dtick"]=6
    fig["layout"]["xaxis"]["tickfont"]={'size':10}
    fig["layout"]["yaxis"] = dict()
    fig["layout"]["yaxis"]["showgrid"] = True
    fig["layout"]["yaxis"]["gridcolor"] = "#3E3F40"
    fig["layout"]["yaxis"]["gridwidth"] = 1
    fig["layout"]['paper_bgcolor'] = app_color["graph_bg"]
    fig["layout"]['plot_bgcolor'] =app_color["graph_bg"]
    fig["layout"]['font'] = {"color": "#fff"}
    
    return fig


# CONCLUDE
@app.callback(Output('ty', 'children'),
              [Input('exp-end', 'n_clicks')],
              [State('stock-qty-1','data'), State('stock-qty-2','data'),\
               State('txn-price-1','data'), State('txn-price-2','data'), State('mturk-id','value')])
def end_experiment(exp_end, x1, x2, p1, p2, mturk):
    if exp_end is None:
        raise PreventUpdate
    if not mturk:
        raise PreventUpdate
    conn = sqlite3.connect('database.db')
    sql = '''INSERT INTO results VALUES(?,?,?,?,?,?)'''
    conn.execute(sql, ("app1", mturk, x1, p1, x2, p2))
    conn.commit()
    conn.close()
    return("Thank you. You may now close this window.")
    
    

def create_db():
    conn = sqlite3.connect('database.db')
    conn.execute('CREATE TABLE results (exp_id TEXT, mturk_id TEXT, q1 TEXT, p1 TEXT, q2 TEXT, p2 TEXT)')
    conn.commit()
    conn.close()


if __name__ == '__main__':
    app.run_server(debug=True) 