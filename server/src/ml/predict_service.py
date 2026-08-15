import os
import sys
import json
import numpy as np
import joblib
import shap

SCRIPT_DIR = os.path.dirname(__file__)
MODEL_ASSETS_DIR = os.path.join(SCRIPT_DIR, 'model_assets')

V2_MODEL_PATH = os.path.join(MODEL_ASSETS_DIR, 'random_forest_cicids2017_improved_v2.joblib')
V2_META_PATH = os.path.join(MODEL_ASSETS_DIR, 'model_metadata_improved_v2.json')

# Cache loaded model & metadata in memory
_MODEL = None
_METADATA = None
_EXPLAINER = None

def load_v2_model():
    global _MODEL, _METADATA, _EXPLAINER
    if _MODEL is None:
        if os.path.exists(V2_MODEL_PATH):
            _MODEL = joblib.load(V2_MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {V2_MODEL_PATH}")
            
    if _METADATA is None:
        if os.path.exists(V2_META_PATH):
            with open(V2_META_PATH, 'r') as f:
                _METADATA = json.load(f)
        else:
            raise FileNotFoundError(f"Metadata file not found at {V2_META_PATH}")
            
    if _EXPLAINER is None and _MODEL is not None:
        _EXPLAINER = shap.TreeExplainer(_MODEL)
        
    return _MODEL, _METADATA, _EXPLAINER

def get_mitre_mapping(threat_class):
    if threat_class in ['DoS / SYN Flood', 'DDoS Volumetric']:
        return {'techniqueId': 'T1498', 'techniqueName': 'Network Denial of Service'}
    elif threat_class == 'Port Scan':
        return {'techniqueId': 'T1046', 'techniqueName': 'Network Service Discovery'}
    elif threat_class in ['FTP Brute Force', 'SSH Brute Force', 'Web Brute Force']:
        return {'techniqueId': 'T1110', 'techniqueName': 'Brute Force'}
    elif threat_class in ['Web Attack (SQLi)', 'Web Attack (XSS)']:
        return {'techniqueId': 'T1190', 'techniqueName': 'Exploit Public-Facing Application'}
    elif threat_class == 'Botnet C2':
        return {'techniqueId': 'T1071', 'techniqueName': 'Application Layer Protocol C2'}
    else:
        return {'techniqueId': 'N/A', 'techniqueName': 'Benign Traffic Operations'}

def get_risk_level(threat_class, confidence):
    if threat_class == 'BENIGN': return 'Low'
    if threat_class in ['DoS / SYN Flood', 'DDoS Volumetric']: return 'Critical'
    if threat_class in ['SSH Brute Force', 'FTP Brute Force', 'Botnet C2', 'Web Attack (SQLi)']: return 'High'
    return 'Medium'

def predict_single_flow(input_features_dict):
    model, metadata, explainer = load_v2_model()
    feature_names = metadata['features']
    
    # Construct ordered feature vector
    feature_vector = []
    for feat in feature_names:
        val = input_features_dict.get(feat, 0.0)
        feature_vector.append(float(val))
        
    X = np.array([feature_vector])
    
    # Predict Probabilities
    probs = model.predict_proba(X)[0]
    classes = model.classes_
    max_idx = np.argmax(probs)
    predicted_class = str(classes[max_idx])
    confidence = float(probs[max_idx])
    
    # Probability per class map
    class_probs = {str(classes[i]): float(probs[i]) for i in range(len(classes))}
    
    # Real TreeSHAP calculation
    try:
        shap_vals = explainer.shap_values(X)
        if isinstance(shap_vals, list):
            sample_shap = shap_vals[max_idx][0]
        else:
            sample_shap = shap_vals[0, :, max_idx] if shap_vals.ndim == 3 else shap_vals[0]
    except Exception:
        sample_shap = np.zeros(len(feature_names))
        
    # Format Top SHAP feature attributions
    top_features = []
    abs_shaps = np.abs(sample_shap)
    sorted_indices = np.argsort(abs_shaps)[::-1][:4] # Top 4 features
    
    for idx in sorted_indices:
        feat_name = feature_names[idx]
        val_str = str(round(feature_vector[idx], 2))
        impact_score = round(float(abs_shaps[idx]), 4)
        direction = 'Positive' if sample_shap[idx] >= 0 else 'Negative'
        
        if direction == 'Positive':
            desc = f"{feat_name} value ({val_str}) strongly increased prediction probability towards {predicted_class}."
        else:
            desc = f"{feat_name} value ({val_str}) conformed closer to baseline expectations."
            
        top_features.append({
            'featureName': feat_name,
            'value': val_str,
            'impactScore': impact_score,
            'direction': direction,
            'description': desc
        })
        
    mitre = get_mitre_mapping(predicted_class)
    risk_level = get_risk_level(predicted_class, confidence)
    
    return {
        'classifiedThreat': predicted_class,
        'riskLevel': risk_level,
        'attackProbability': round(confidence if predicted_class != 'BENIGN' else 1.0 - confidence, 4),
        'predictedConfidence': round(confidence, 4),
        'mitreMapping': mitre,
        'topFeatures': top_features,
        'classProbabilities': class_probs,
        'extractedFeatures': {feat: round(val, 2) for feat, val in zip(feature_names, feature_vector)},
        'modelVersion': metadata.get('version', '2.2.0')
    }

if __name__ == '__main__':
    # CLI mode for Node.js IPC
    if len(sys.argv) > 1:
        try:
            raw_input = sys.argv[1]
            features_dict = json.loads(raw_input)
            result = predict_single_flow(features_dict)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({'error': str(e)}))
    else:
        # Self-test
        sample_dict = {'Flow Duration': 500000, 'SYN Flag Count': 45, 'Flow Packets/s': 20000}
        res = predict_single_flow(sample_dict)
        print(json.dumps(res, indent=2))
