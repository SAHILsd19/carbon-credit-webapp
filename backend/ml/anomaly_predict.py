import sys
import json
import numpy as np
import joblib
import os

BASE = os.path.dirname(__file__)
scaler = joblib.load(os.path.join(BASE, "scaler.joblib"))
iforest = joblib.load(os.path.join(BASE, "isolation_forest.joblib"))
feature_columns = json.load(open(os.path.join(BASE, "feature_columns.json")))

payload = json.loads(sys.stdin.read())

row = np.array([[payload.get(col, 0) for col in feature_columns]])
row_scaled = scaler.transform(row)

# Raw IF score
if_score = float(-iforest.decision_function(row_scaled))
raw = abs(if_score)

# -----------------------------------------------------------------------
# 1️⃣ Convert IF score → base verification score
# -----------------------------------------------------------------------
if raw < 0.01:
    verification_score = 95 + (0.01 - raw) * 300
elif raw < 0.05:
    verification_score = 70 + (0.05 - raw) * 200
elif raw < 0.12:
    verification_score = 45 + (0.12 - raw) * 150
else:
    verification_score = 40 - raw * 200

# -----------------------------------------------------------------------
# 2️⃣ Domain logic — catch under reporting and over reporting
# -----------------------------------------------------------------------
scope1 = payload["reported_scope_1_metric_tonnes_co2e"]
scope2 = payload["reported_scope_2_metric_tonnes_co2e"]

# ---------------- UNDER-REPORTING / OVER-REPORTING PENALTIES ----------------
low_penalty = 0

# Extremely small → major fraud suspicion
if scope1 < 10 or scope2 < 10:
    low_penalty -= 65
elif scope1 < 50 or scope2 < 50:
    low_penalty -= 45
elif scope1 < 200 or scope2 < 200:
    low_penalty -= 25

# Very high emissions → also suspicious
high_penalty = 0
if scope1 > 20000 or scope2 > 50000:
    high_penalty -= 30

verification_score += low_penalty + high_penalty


verification_score = max(0, min(100, round(verification_score)))

# -----------------------------------------------------------------------
# 3️⃣ Decide status
# -----------------------------------------------------------------------
if verification_score >= 70:
    status = "Verified"
elif verification_score >= 45:
    status = "Review"
else:
    status = "Rejected"

output = {
    "status": status,
    "score": verification_score,
    "ifScore": if_score
}

print(json.dumps(output))
