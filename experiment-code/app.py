from flask import Flask, request
import requests
from flask_cors import CORS, cross_origin

from typing import Union
import sqlite3
from apscheduler.schedulers.background import BackgroundScheduler
import time
import random
from loguru import logger


app = Flask(__name__)
cors = CORS(app)
INTERVAL = 5
TS0 = -1
TABLENAME = ''

# url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes"
# querystring = {"region":"US","symbols":"TSLA"}
# headers = {
#     'x-rapidapi-key': "57a6f99753mshf2f96c7d07b7f5fp1892c3jsn4bf4d977a411",
#     'x-rapidapi-host': "apidojo-yahoo-finance-v1.p.rapidapi.com"
#     }
# response = requests.request("GET", url, headers=headers, params=querystring)
# print(response.text)

conn = sqlite3.connect('experiment.db', check_same_thread=False)


def get_curr_quote():
    logger.info(int(time.time()))
    insert_db(int(time.time()), random.randint(2, 20))

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
        logger.debug(f"SELECT * FROM {TABLENAME} WHERE ts BETWEEN {idx}")
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
    logger.info(f'TS Key for ts={ts} | TS0]{TS0}: {curr_ts} ')
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
    return {'prev': prev_qt[1], 'curr': curr_qt[1]}


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
