import pandas as pd
import os, json

def main():
    dic=[]
    for fl in os.listdir('data'):
        name = fl.split('.')[0]
        df = pd.read_csv(f'data/{fl}')
        df.date = pd.to_datetime(df.date)
        df = df.sort_values('date')
        df.date = df.date.dt.strftime("%Y-%m-%d")
        dic.append({'name': name, 'timestamps':list(df.date.values), 'prices':list(df['value'].values)})

    with open('data/data.json', 'w') as j:
        json.dump(dic, j)


if __name__=="__main__":
    main()
