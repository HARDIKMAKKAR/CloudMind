from flask import Flask, request, jsonify
import numpy as np
import joblib

from keras.models import load_model

app = Flask(__name__)

# ----------------------------------------
# Load Models
# ----------------------------------------

lstm_model = load_model("lstm_model.keras")

anomaly_model = joblib.load("anomaly_model.pkl")

failure_model = joblib.load("failure_model.pkl")

scaling_model = joblib.load("scaling_model.pkl")

sequence_length = 5

cpu_history = [50,55,60,65,70]

# ----------------------------------------
# Prediction API
# ----------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    global cpu_history

    data = request.json

    cpu = data.get("cpu",50)
    memory = data.get("memory",50)
    latency = data.get("latency",80)

    cpu_history.append(cpu)

    if len(cpu_history) > sequence_length:
        cpu_history = cpu_history[-sequence_length:]

    sequence = np.array(cpu_history).reshape((1,sequence_length,1))

    predicted_cpu = lstm_model.predict(sequence)[0][0]

    anomaly = anomaly_model.predict([[cpu]])[0] == -1

    failure = failure_model.predict([[cpu,memory,latency]])[0]

    failure_risk = "high" if failure == 1 else "low"

    scale = scaling_model.predict([[cpu]])[0]

    scaling_action = "no_action"

    if scale == 0:
        scaling_action = "scale_down"

    elif scale == 2:
        scaling_action = "scale_up"

    return jsonify({
        "metrics":{
            "cpu":cpu,
            "memory":memory,
            "latency":latency
        },
        "predicted_cpu":float(predicted_cpu),
        "anomaly_detected":bool(anomaly),
        "failure_risk":failure_risk,
        "scaling_decision":scaling_action
    })


@app.route("/health")
def health():
    return jsonify({"status":"CloudMind ML service running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)