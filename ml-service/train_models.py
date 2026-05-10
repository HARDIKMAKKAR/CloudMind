import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

print("Loading dataset...")

df = pd.read_csv("cloudmind_training_data.csv")

# ----------------------------------------
# 1️⃣ LSTM Workload Prediction Model
# ----------------------------------------

print("Training LSTM workload model...")

cpu_values = df["cpu"].values
future_cpu = df["future_cpu"].values

sequence_length = 5

X = []
y = []

for i in range(len(cpu_values) - sequence_length):
    X.append(cpu_values[i:i+sequence_length])
    y.append(future_cpu[i])

X = np.array(X)
y = np.array(y)

X = X.reshape((X.shape[0], X.shape[1], 1))

model = Sequential()
model.add(LSTM(32, input_shape=(sequence_length,1)))
model.add(Dense(1))

model.compile(optimizer="adam", loss="mse")

model.fit(X, y, epochs=10, batch_size=32)

# model.save("lstm_workload_model.h5")
model.save("lstm_model.keras")

print("LSTM model saved")

# ----------------------------------------
# 2️⃣ Anomaly Detection
# ----------------------------------------

print("Training anomaly detection model...")

X_anomaly = df[["cpu"]]

anomaly_model = IsolationForest(contamination=0.05)
anomaly_model.fit(X_anomaly)

joblib.dump(anomaly_model, "anomaly_model.pkl")

print("Anomaly model saved")

# ----------------------------------------
# 3️⃣ Failure Prediction
# ----------------------------------------

print("Training failure prediction model...")

X_failure = df[["cpu","memory","latency"]]
y_failure = df["failure"]

failure_model = LogisticRegression()
failure_model.fit(X_failure, y_failure)

joblib.dump(failure_model, "failure_model.pkl")

print("Failure model saved")

# ----------------------------------------
# 4️⃣ Scaling Decision
# ----------------------------------------

print("Training scaling model...")

X_scale = df[["cpu"]]
y_scale = df["scaling"]

scaling_model = DecisionTreeClassifier(max_depth=4)
scaling_model.fit(X_scale, y_scale)

joblib.dump(scaling_model, "scaling_model.pkl")

print("Scaling model saved")

print("\nAll models trained successfully")