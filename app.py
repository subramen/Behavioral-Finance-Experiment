import dash
import dash_html_components as html
from dash.dependencies import Input, Output, State
import common_utils as utils
import flask
import config


external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
server = app.server



app.layout = config.app_layout



# WATERCOOLER
@app.callback(Output('watercooler', 'data'), [Input("interval-component", "n_intervals")])
def watercooler_break(interval):
    return utils.watercooler_break(interval, "app2")


# SCREEN CONTROL
@app.callback([Output('screen1','style'), Output('screen2','style'), Output('screen3', 'style')],# Output('mturk-id-store','data')], \
               [Input('user-begin', 'n_clicks'), Input('continue-button', 'n_clicks')],
               [State('mturk-id-input','value'), State('survey1','value'), State('survey2','value')])
def start_exp(nclick1, nclick2, mturk_id, surv1, surv2):
    return utils.start_exp(nclick1, nclick2, mturk_id, surv1, surv2)

    

# GET CURRENT PRICE AND DATE
@app.callback([Output("today_price-store", "data"), Output("today_dt-store","data"), \
               Output('position-store','data'), Output('p&l-store','data'), Output('data-end', 'data')], 
              [Input("interval-component", "n_intervals")], \
              [State('stock-store','data'), State('stock-qty-1','data'), \
               State('stock-qty-2','data'), State('txn-price-1','data'), State('txn-price-2','data'), State('data-end','data'), State("cash-store",'data')])
def update_currents(interval, stock, x1, x2, cp1, cp2, dataend, cash):
    return utils.update_currents(interval, stock, x1, x2, cp1, cp2, dataend, cash)


# UPDATE DISPLAY STR
@app.callback([Output("today_price-str", "children"), Output('cash-str','children'), Output('stock-str','children'), \
               Output('position-str','children'), Output('p&l-str','children'), Output('p&l-str','style'), Output('position-str', 'style')], 
              [Input("today_price-store", "data"), Input("today_dt-store","data"), Input("watercooler","data")],
              [State("cash-store",'data'), State('stock-store','data'), \
               State('position-store','data'), State('p&l-store','data')])
def update_str(price,date, wc, cash, stock, pos, pnl):
    return utils.update_str(price, date, wc, cash, stock, pos, pnl)


@app.callback(Output("today-str", "children"), [Input("today_dt-store","data")]):
def update_today_str(date):
	return utils.update_today_str(date)

    
    
# PAUSE INTERVAL TO ASK FOR BID
# Disable interval timer, Enable submit button, Prompt for bid
@app.callback([Output("interval-component", "disabled"), Output("submit", "disabled"),\
               Output("ask-bid", "children")], 
               [Input("interval-component", "n_intervals"), Input("bid_submitted1",'data'), \
                Input("bid_submitted2",'data'), Input('screen2', 'style'), Input('data-end', 'data'), Input("watercooler","data")],
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


@app.callback(Output("interval-component", "interval"), [Input("bid_submitted2",'data') ])
def fast_forward_end(bid_submitted2):
    return utils.fast_forward_end(bid_submitted2)


 #PAUSE BEFORE END
@app.callback([Output('input-col','style'), Output('continue-col','style'), Output('continue-button','disabled')],[Input('data-end','data')])
def continue_to_conclusion(dataend):
	return utils.continue_to_conclusion(dataend)


# CONCLUDE
@app.callback([Output('winnings','children'),Output('ty', 'children'), Output('winnings','style'), Output('rng','children'), \
	Output('conclude','style'), Output('end-submit', 'disabled')],
              [Input('end-submit', 'n_clicks')],
              [State('stock-qty-1','data'), State('stock-qty-2','data'),\
               State('txn-price-1','data'), State('txn-price-2','data'), State('position-store','data'),\
               State('mturk-id-input','value'), State('survey1','value'), State('survey2','value'), State('survey3','value'), \
               State('survey4','value'), State('survey5','value')])
def end_experiment(exp_end, x1, x2, p1, p2, curr_pos, mturk, s1, s2, s3, s4, s5):
    return utils.end_experiment(exp_end, x1, x2, p1, p2, curr_pos, mturk, s1, s2, s3, s4, s5, "app2")
    
    
if __name__ == "__main__":
    app.run_server() 
