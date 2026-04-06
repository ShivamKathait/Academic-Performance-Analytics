import json
import os
import sys

import joblib
import pandas as pd

current_dir = os.path.dirname(__file__)
model_path = os.path.join(current_dir, "student_performance_model.joblib")
model = joblib.load(model_path)

payload = json.loads(sys.argv[1])
features = pd.DataFrame([payload])
prediction = str(model.predict(features)[0])
probabilities = model.predict_proba(features)[0]
probability_map = {
    str(label): round(float(probability), 4)
    for label, probability in zip(model.classes_, probabilities)
}

print(json.dumps({
    "prediction": prediction,
    "probabilities": probability_map,
}))
