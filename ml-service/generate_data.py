import numpy as np
import pandas as pd

rows = 3000

data = []

for i in range(rows):

    cpu = np.random.randint(10, 100)
    memory = np.random.randint(20, 100)
    latency = np.random.randint(20, 200)

    future_cpu = cpu + np.random.randint(-10, 15)

    anomaly = 1 if cpu > 90 or latency > 180 else 0

    failure = 1 if cpu > 92 and memory > 90 else 0

    if cpu > 80:
        scaling = 2
    elif cpu < 25:
        scaling = 0
    else:
        scaling = 1

    data.append([
        cpu,
        memory,
        latency,
        future_cpu,
        anomaly,
        failure,
        scaling
    ])

df = pd.DataFrame(data, columns=[
    "cpu",
    "memory",
    "latency",
    "future_cpu",
    "anomaly",
    "failure",
    "scaling"
])

df.to_csv("cloudmind_training_data.csv", index=False)

print("Dataset created")