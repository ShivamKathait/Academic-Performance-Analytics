import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CURRENT_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(CURRENT_DIR, "student_performance_dataset.csv")
MODEL_PATH = os.path.join(CURRENT_DIR, "student_performance_model.joblib")
TARGET_COLUMN = "Predicted Result"
CLASS_ORDER = ["At Risk", "Needs Attention", "On Track"]


def main():
    df = pd.read_csv(DATASET_PATH)

    X = df.drop(TARGET_COLUMN, axis=1)
    y = pd.Categorical(df[TARGET_COLUMN], categories=CLASS_ORDER, ordered=True)

    categorical_features = ["Department", "Gender", "Course"]
    numeric_features = [column for column in X.columns if column not in categorical_features]

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("numeric", StandardScaler(), numeric_features),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                LogisticRegression(
                    max_iter=1500,
                ),
            ),
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)
    print("Updated academic model saved successfully.")


if __name__ == "__main__":
    main()
