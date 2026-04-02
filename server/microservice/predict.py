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
result = model.predict(features)[0]
print("On Track" if result == 1 else "At Risk")
