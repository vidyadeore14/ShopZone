import pandas as pd

df = pd.read_csv("products.csv", sep="\t")
print(df.columns.tolist())
