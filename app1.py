import dash
import dash_html_components as html
from dash.dependencies import Input, Output, State
import common_utils as utils

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = dash.Dash('app1', external_stylesheets=external_stylesheets)



app.layout = html.Div(utils.get_screens())



# WATERCOOLER
@app.callback(Output('watercooler', 'data'), [Input("interval-component", "n_intervals")])
def watercooler_break(interval):
    return utils.watercooler_break(interval, app.config['name'])


# SCREEN CONTROL
@app.callback([Output('screen1','style'), Output('screen2','style'), Output('screen3', 'style')], \
               [Input('user-begin', 'n_clicks'), Input('data-end', 'data')])
def start_exp(nclick1, dataend):
    return utils.start_exp(nclick1, dataend)

    

# GET CURRENT PRICE AND DATE
@app.callback([Output("today_price-store", "data"), Output("today_dt-store","data"), \
               Output('position-store','data'), Output('p&l-store','data'), Output('data-end', 'data')], 
              [Input("interval-component", "n_intervals")], \
              [State('stock-store','data'), State('stock-qty-1','data'), \
               State('stock-qty-2','data'), State('txn-price-1','data'), State('txn-price-2','data'), State('data-end','data')])
def update_currents(interval, stock, x1, x2, cp1, cp2, dataend):
    return utils.update_currents(interval, stock, x1, x2, cp1, cp2, dataend)


# UPDATE DISPLAY STR
@app.callback([Output("today_price-str", "children"), Output("today-str","children"), \
               Output('cash-str','children'), Output('stock-str','children'), \
               Output('position-str','children'), Output('p&l-str','children'), Output('p&l-str','style')], 
              [Input("today_price-store", "data"), Input("today_dt-store","data"), Input("watercooler","data")],
              [State("cash-store",'data'), State('stock-store','data'), \
               State('position-store','data'), State('p&l-store','data')])
def update_today_str(price, date, wc, cash, stock, pos, pnl):
    return utils.update_today_str(price, date, wc, cash, stock, pos, pnl)


    
    
# PAUSE INTERVAL TO ASK FOR BID
# Disable interval timer, Enable submit button, Prompt for bid
@app.callback([Output("interval-component", "disabled"), Output("submit", "disabled"),\
               Output("ask-bid", "children")], 
               [Input("interval-component", "n_intervals"), Input("bid_submitted1",'data'), \
                Input("bid_submitted2",'data'), Input('user-begin', 'n_clicks'), Input('data-end', 'data'), Input("watercooler","data")],
                [State("cash-store",'data'), State('today_price-store','data'), State('stock-store','data'),])
def toggle_interval_for_bid(interval, bid_submitted1, bid_submitted2, begin_click, dataend, wc, cash, price, stock):
    return utils.toggle_interval_for_bid(interval, bid_submitted1, bid_submitted2, begin_click, dataend, wc, cash, price, stock)
    


# GET BID
@app.callback([Output("cash-store",'data'), Output('stock-store','data'), \
               Output('bid_submitted1','data'), Output('bid_submitted2','data'), \
               Output('stock-qty-1','data'), Output('stock-qty-2','data'),\
               Output('txn-price-1','data'), Output('txn-price-2','data')], 
    
              [Input("submit",'n_clicks')],
    
              [State('txn','value'), State('buysell','value'), State("cash-store",'data'), \
               State('stock-store','data'), State('today_price-store','data'), \
               State("interval-component", "n_intervals"), State('bid_submitted1','data'), \
               State('bid_submitted2','data'), State('stock-qty-1','data'), State('stock-qty-2','data'),\
               State('txn-price-1','data'), State('txn-price-2','data')]
          )
def get_trade(n_clicks, stock_qty, buysell, curr_cash, curr_stock, today_price, interval, b1, b2, x1, x2, cp1, cp2):
    return utils.get_trade(n_clicks, stock_qty, buysell, curr_cash, curr_stock, today_price, interval, b1, b2, x1, x2, cp1, cp2)
        


# UPDATE GRAPH
@app.callback(
    Output("price-graph", "figure"), [Input("interval-component", "n_intervals"), Input("watercooler","data")]
)
def plot_prices(interval, wc):
    return utils.plot_prices(interval, wc)

# CONCLUDE
@app.callback(Output('ty', 'children'),
              [Input('exp-end', 'n_clicks')],
              [State('stock-qty-1','data'), State('stock-qty-2','data'),\
               State('txn-price-1','data'), State('txn-price-2','data'), State('mturk-id','value')])
def end_experiment(exp_end, x1, x2, p1, p2, mturk):
    return utils.end_experiment(exp_end, x1, x2, p1, p2, mturk, app.config['name'])
    
    


if __name__ == '__main__':
    app.run_server(debug=True) 