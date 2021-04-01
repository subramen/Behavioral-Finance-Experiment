from flask import Flask, request
import requests
from flask_cors import CORS, cross_origin

from typing import Union
import sqlite3
from apscheduler.schedulers.background import BackgroundScheduler
import time
import random
from loguru import logger
import json


app = Flask(__name__, static_folder='build/', static_url_path='/')
cors = CORS(app)

TEST = True

INTERVAL = 5
TS0 = -1
TABLENAME = ''
URL = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes"
HEADERS = {
    'x-rapidapi-key': "57a6f99753mshf2f96c7d07b7f5fp1892c3jsn4bf4d977a411",
    'x-rapidapi-host': "apidojo-yahoo-finance-v1.p.rapidapi.com"
    }


conn = sqlite3.connect('yfinance.db', check_same_thread=False)
# conn = sqlite3.connect('users.db')


def get_curr_quote():
    if TEST:
        d = random.randint(2, 20)
    else:
        response = requests.request("GET", URL, headers=HEADERS, params={"region":"US","symbols":"TSLA"})
        d = json.loads(response.text)['quoteResponse']['result'][0]['regularMarketPrice']
    insert_db(int(time.time()), d)

def create_db():
    logger.info(f"Creating table {TABLENAME}")
    c = conn.cursor()
    c.execute(f"CREATE TABLE IF NOT EXISTS {TABLENAME} (ts integer primary key, price real)")
    conn.commit()
    

def insert_db(ts, price):
    c = conn.cursor()
    c.execute(f"INSERT INTO {TABLENAME} VALUES (?, ?)", (ts, price))
    conn.commit()


def select_db(idx: Union[int, tuple]):
    c = conn.cursor()
    if isinstance(idx, tuple):
        c.execute(f"SELECT * FROM {TABLENAME} WHERE ts BETWEEN ? AND ?", idx)
        return c.fetchall()
    else:
        c.execute(f"SELECT * FROM {TABLENAME} WHERE ts=?", (idx,))
        return c.fetchone()


def set_ts0():
    global TS0
    c = conn.cursor()
    c.execute(f"SELECT ts FROM {TABLENAME} ORDER BY ts ASC LIMIT 1")
    TS0 = c.fetchone()[0]


def get_ts_key(ts):
    if TS0 == -1:
        set_ts0()
    return TS0 + ( (ts - 0.1 - TS0) // INTERVAL ) * INTERVAL


def get_quote(ts):
    curr_ts = get_ts_key(ts)
    prev_ts = curr_ts - INTERVAL
    if prev_ts < TS0:
        out = [(0, 0), select_db(curr_ts)]
    else:
        out = select_db((prev_ts, curr_ts,))
    return out


@app.route("/get")
@cross_origin()
def get_curr_prev_quote():
    ts = int(time.time())
    try:
        prev_qt, curr_qt = get_quote(ts)
    except ValueError as e:
        logger.error(e)
        prev_qt, curr_qt = [(0,0), (0,0)]
    return {'prev': prev_qt, 'curr': curr_qt}


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route("/slice/<start>/<end>")
@cross_origin()
def get_slice_quote(start, end):
    start = int(start)
    end = int(end)
    try:
        ts, prices = list(zip(*select_db((start, end,))))
    except ValueError:
        ts, prices = ([], [])
    return {'labels': ts, 'quotes': prices}

@app.before_first_request
def setup():
    global TABLENAME
    TABLENAME = f'quotes_{int(time.time())}'
    create_db()
    sch = BackgroundScheduler()
    sch.add_job(get_curr_quote, 'interval', seconds=INTERVAL)
    sch.start()



if __name__ == "__main__":
    setup()
    app.run('0.0.0.0', port=5000)
