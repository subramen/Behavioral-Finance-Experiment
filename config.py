# -*- coding: utf-8 -*-
"""
Created on Sat Nov 23 13:36:58 2019

@author: suraj
"""
import dash_core_components as dcc
import dash_html_components as html


INTERVAL_LENGTH = 2500




status0 = {'cash':1000, 'stock':0, 'position':0} #defaults
app_color = {"graph_bg": "#082255", "graph_line": "#007ACE"}             

screen1 = html.Div(id='screen1', style={'text-align':'center'},\
                   children=[html.H1('Welcome!'), \
                   html.Br(),html.Br(),\
                   html.H4("In this task, you have $1,000 to invest in a large tech company."), 
                   html.H4("Use the first five minutes to track the stock's movements."),\
                   html.Br(),
                   html.H4("You will get two chances to trade on the market."),\
                   html.H4("Top 3 winners are eligible for Amazon gift cards worth their winnings. Play smart!", style={'color':'RoyalBlue'}),\
                   html.Br(),html.Br(),html.Br(),\
                   html.H6('To start, click Begin', style={'display':'inline-block'}), html.Br(), \
                   html.Button('Begin', id='user-begin', style={'display':'inline-block'})])

screen2 = html.Div(id='screen2',style={'display':'none'}, children = [
        # TITLE
        html.H3(children='Stock Market'),
        html.P("Click and drag to zoom in. Double-click to zoom out"),
        
        # INTERNAL VARIABLES
        dcc.Interval(id='interval-component',interval=INTERVAL_LENGTH, n_intervals=0, disabled=True),
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
        dcc.Store(id='bid_submitted1', data=False),
        dcc.Store(id='bid_submitted2', data=False),
        
        dcc.Store(id='watercooler',data=False),
        
        # LAYOUT
        html.Div(id='toprow', style={'width':'100%', 'overflow':'auto'}, children=[html.Div(dcc.Graph(id="price-graph"))]),
        # html.Br(),
        html.Div(id='bottomrow', style={'width':'100%', 'overflow':'auto'}, children=[
                html.Div(id='input-col', style={'float':'right', 'width':'40%', 'overflow':'auto'}, children=[
                    html.H3(id='ask-bid', children=' ', style={'color':'red'}),
#                    html.Div(id='bid_submitted1', style={'display': 'none'}, children='no'),
#                    html.Div(id='bid_submitted2', style={'display': 'none'}, children='no'),
                    html.Div(id='buy/sell', style={'float':'center', 'overflow':'auto'}, children=[
                         html.Div(dcc.Input(id="txn", type='number', placeholder='No. of Stocks', min=0), style={'float':'left'}),
                         dcc.RadioItems(id='buysell', options=[{'label':'BUY', 'value':1}, {'label':'SELL', 'value':-1}], style={'overflow':'auto'}),
                         html.Br(),
                         html.Button('Submit', id='submit', hidden=True),
                         html.Div(id='buy-sell-status'),
                         ])]),

                html.Div(id='status-col', style={'display':'inline-block', 'width':'25%','overflow':'auto'}, children=[
                    html.Table([
                            html.Tr([html.Th(style={'display':'block'}, children=['Available Cash']), \
                                     html.Th(style={'display':'block'}, children=['Stocks Held']), \
                                     html.Th(style={'display':'block'}, children=['Net Worth']), \
                                     html.Th(style={'display':'block'}, children=['Today is'])],
                                 style={'float':'left', 'display':'block'}),
                                     
                            html.Tr([html.Td(style={'display':'block', 'color':'green'}, id='cash-str', children="${}".format(status0['cash'])), \
                                     html.Td(style={'display':'block'}, id='stock-str', children="0"), \
                                     html.Td(style={'display':'block'}, id='position-str', children="$0"), \
                                     html.Td(style={'display':'block'}, id='today-str', children="09/16 09:30")],
                                 style={'float':'left', 'display':'block'}),
                        ])]),
                                     
                html.Div(id='calendar-col', style={'float':'left', 'width':'25%','overflow':'auto'}, children=[
                        html.H3(id='p&l-str', children="$0"),
                        html.H4(id='today_price-str', children="Current Price: $200"),
                        ])])])
                            
screen3 = html.Div(id='screen3', style={'display':'none', 'float':'center'},children=[
                   html.H3('Enter your MTurk Worker ID to receive compensation for this task.'), \
                   html.Br(),\
                   dcc.Input(id='mturk-id', placeholder='Mturk Worker ID'), html.Button('End Task', id='exp-end'), html.Br(), html.Br(),\
                   html.H3(id='winnings'), html.Br(), html.H4(id='ty', style={'text-align':'center'})])
                            


app_layout = html.Div([screen1, screen2, screen3])























