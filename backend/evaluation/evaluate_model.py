from sklearn.metrics import f1_score, classification_report, confusion_matrix
import numpy as np

# Python 버전 분류기 import
from emotionClassifier import MusicEmotionClassifier

# 테스트 데이터 (예시 - 실제로는 더 많은 데이터 필요)
test_data = [
    # Happy 곡들 (25곡)
    {'valence': 0.85, 'energy': 0.75, 'danceability': 0.70, 'acousticness': 0.15, 'true_emotion': 'happy'},
    {'valence': 0.90, 'energy': 0.80, 'danceability': 0.75, 'acousticness': 0.10, 'true_emotion': 'happy'},
    {'valence': 0.78, 'energy': 0.72, 'danceability': 0.68, 'acousticness': 0.20, 'true_emotion': 'happy'},
    {'valence': 0.82, 'energy': 0.77, 'danceability': 0.72, 'acousticness': 0.18, 'true_emotion': 'happy'},
    {'valence': 0.88, 'energy': 0.82, 'danceability': 0.78, 'acousticness': 0.12, 'true_emotion': 'happy'},
    {'valence': 0.91, 'energy': 0.85, 'danceability': 0.80, 'acousticness': 0.08, 'true_emotion': 'happy'},
    {'valence': 0.76, 'energy': 0.70, 'danceability': 0.65, 'acousticness': 0.22, 'true_emotion': 'happy'},
    {'valence': 0.83, 'energy': 0.74, 'danceability': 0.69, 'acousticness': 0.16, 'true_emotion': 'happy'},
    {'valence': 0.87, 'energy': 0.79, 'danceability': 0.73, 'acousticness': 0.14, 'true_emotion': 'happy'},
    {'valence': 0.79, 'energy': 0.73, 'danceability': 0.67, 'acousticness': 0.19, 'true_emotion': 'happy'},
    {'valence': 0.84, 'energy': 0.76, 'danceability': 0.71, 'acousticness': 0.17, 'true_emotion': 'happy'},
    {'valence': 0.89, 'energy': 0.81, 'danceability': 0.76, 'acousticness': 0.11, 'true_emotion': 'happy'},
    {'valence': 0.77, 'energy': 0.71, 'danceability': 0.66, 'acousticness': 0.21, 'true_emotion': 'happy'},
    {'valence': 0.86, 'energy': 0.78, 'danceability': 0.74, 'acousticness': 0.13, 'true_emotion': 'happy'},
    {'valence': 0.81, 'energy': 0.75, 'danceability': 0.70, 'acousticness': 0.18, 'true_emotion': 'happy'},
    {'valence': 0.92, 'energy': 0.86, 'danceability': 0.81, 'acousticness': 0.09, 'true_emotion': 'happy'},
    {'valence': 0.80, 'energy': 0.74, 'danceability': 0.69, 'acousticness': 0.19, 'true_emotion': 'happy'},
    {'valence': 0.85, 'energy': 0.77, 'danceability': 0.72, 'acousticness': 0.15, 'true_emotion': 'happy'},
    {'valence': 0.88, 'energy': 0.80, 'danceability': 0.75, 'acousticness': 0.12, 'true_emotion': 'happy'},
    {'valence': 0.78, 'energy': 0.72, 'danceability': 0.67, 'acousticness': 0.20, 'true_emotion': 'happy'},
    {'valence': 0.83, 'energy': 0.76, 'danceability': 0.71, 'acousticness': 0.16, 'true_emotion': 'happy'},
    {'valence': 0.90, 'energy': 0.83, 'danceability': 0.78, 'acousticness': 0.10, 'true_emotion': 'happy'},
    {'valence': 0.82, 'energy': 0.75, 'danceability': 0.70, 'acousticness': 0.17, 'true_emotion': 'happy'},
    {'valence': 0.87, 'energy': 0.79, 'danceability': 0.74, 'acousticness': 0.14, 'true_emotion': 'happy'},
    {'valence': 0.79, 'energy': 0.73, 'danceability': 0.68, 'acousticness': 0.19, 'true_emotion': 'happy'},
    
    # Sad 곡들 (25곡)
    {'valence': 0.15, 'energy': 0.25, 'danceability': 0.30, 'acousticness': 0.70, 'true_emotion': 'sad'},
    {'valence': 0.20, 'energy': 0.30, 'danceability': 0.28, 'acousticness': 0.75, 'true_emotion': 'sad'},
    {'valence': 0.18, 'energy': 0.22, 'danceability': 0.25, 'acousticness': 0.68, 'true_emotion': 'sad'},
    {'valence': 0.12, 'energy': 0.20, 'danceability': 0.22, 'acousticness': 0.80, 'true_emotion': 'sad'},
    {'valence': 0.22, 'energy': 0.28, 'danceability': 0.32, 'acousticness': 0.72, 'true_emotion': 'sad'},
    {'valence': 0.17, 'energy': 0.24, 'danceability': 0.27, 'acousticness': 0.74, 'true_emotion': 'sad'},
    {'valence': 0.19, 'energy': 0.26, 'danceability': 0.29, 'acousticness': 0.76, 'true_emotion': 'sad'},
    {'valence': 0.14, 'energy': 0.21, 'danceability': 0.24, 'acousticness': 0.78, 'true_emotion': 'sad'},
    {'valence': 0.21, 'energy': 0.29, 'danceability': 0.31, 'acousticness': 0.71, 'true_emotion': 'sad'},
    {'valence': 0.16, 'energy': 0.23, 'danceability': 0.26, 'acousticness': 0.73, 'true_emotion': 'sad'},
    {'valence': 0.13, 'energy': 0.19, 'danceability': 0.21, 'acousticness': 0.79, 'true_emotion': 'sad'},
    {'valence': 0.23, 'energy': 0.31, 'danceability': 0.33, 'acousticness': 0.69, 'true_emotion': 'sad'},
    {'valence': 0.18, 'energy': 0.25, 'danceability': 0.28, 'acousticness': 0.75, 'true_emotion': 'sad'},
    {'valence': 0.15, 'energy': 0.22, 'danceability': 0.25, 'acousticness': 0.77, 'true_emotion': 'sad'},
    {'valence': 0.20, 'energy': 0.27, 'danceability': 0.30, 'acousticness': 0.72, 'true_emotion': 'sad'},
    {'valence': 0.17, 'energy': 0.24, 'danceability': 0.27, 'acousticness': 0.74, 'true_emotion': 'sad'},
    {'valence': 0.19, 'energy': 0.26, 'danceability': 0.29, 'acousticness': 0.73, 'true_emotion': 'sad'},
    {'valence': 0.14, 'energy': 0.20, 'danceability': 0.23, 'acousticness': 0.78, 'true_emotion': 'sad'},
    {'valence': 0.22, 'energy': 0.30, 'danceability': 0.32, 'acousticness': 0.70, 'true_emotion': 'sad'},
    {'valence': 0.16, 'energy': 0.23, 'danceability': 0.26, 'acousticness': 0.76, 'true_emotion': 'sad'},
    {'valence': 0.18, 'energy': 0.25, 'danceability': 0.28, 'acousticness': 0.74, 'true_emotion': 'sad'},
    {'valence': 0.13, 'energy': 0.21, 'danceability': 0.24, 'acousticness': 0.79, 'true_emotion': 'sad'},
    {'valence': 0.21, 'energy': 0.28, 'danceability': 0.31, 'acousticness': 0.71, 'true_emotion': 'sad'},
    {'valence': 0.15, 'energy': 0.22, 'danceability': 0.25, 'acousticness': 0.77, 'true_emotion': 'sad'},
    {'valence': 0.19, 'energy': 0.27, 'danceability': 0.30, 'acousticness': 0.73, 'true_emotion': 'sad'},
    
    # Energetic 곡들 (25곡)
    {'valence': 0.60, 'energy': 0.90, 'danceability': 0.85, 'acousticness': 0.10, 'true_emotion': 'energetic'},
    {'valence': 0.65, 'energy': 0.88, 'danceability': 0.82, 'acousticness': 0.08, 'true_emotion': 'energetic'},
    {'valence': 0.58, 'energy': 0.92, 'danceability': 0.87, 'acousticness': 0.12, 'true_emotion': 'energetic'},
    {'valence': 0.62, 'energy': 0.89, 'danceability': 0.84, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.67, 'energy': 0.91, 'danceability': 0.86, 'acousticness': 0.07, 'true_emotion': 'energetic'},
    {'valence': 0.59, 'energy': 0.87, 'danceability': 0.83, 'acousticness': 0.11, 'true_emotion': 'energetic'},
    {'valence': 0.63, 'energy': 0.90, 'danceability': 0.85, 'acousticness': 0.10, 'true_emotion': 'energetic'},
    {'valence': 0.66, 'energy': 0.93, 'danceability': 0.88, 'acousticness': 0.06, 'true_emotion': 'energetic'},
    {'valence': 0.61, 'energy': 0.88, 'danceability': 0.84, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.64, 'energy': 0.91, 'danceability': 0.86, 'acousticness': 0.08, 'true_emotion': 'energetic'},
    {'valence': 0.68, 'energy': 0.94, 'danceability': 0.89, 'acousticness': 0.05, 'true_emotion': 'energetic'},
    {'valence': 0.60, 'energy': 0.89, 'danceability': 0.85, 'acousticness': 0.10, 'true_emotion': 'energetic'},
    {'valence': 0.62, 'energy': 0.90, 'danceability': 0.86, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.65, 'energy': 0.92, 'danceability': 0.87, 'acousticness': 0.07, 'true_emotion': 'energetic'},
    {'valence': 0.59, 'energy': 0.88, 'danceability': 0.84, 'acousticness': 0.11, 'true_emotion': 'energetic'},
    {'valence': 0.63, 'energy': 0.91, 'danceability': 0.86, 'acousticness': 0.08, 'true_emotion': 'energetic'},
    {'valence': 0.67, 'energy': 0.93, 'danceability': 0.88, 'acousticness': 0.06, 'true_emotion': 'energetic'},
    {'valence': 0.61, 'energy': 0.89, 'danceability': 0.85, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.64, 'energy': 0.90, 'danceability': 0.86, 'acousticness': 0.08, 'true_emotion': 'energetic'},
    {'valence': 0.66, 'energy': 0.92, 'danceability': 0.87, 'acousticness': 0.07, 'true_emotion': 'energetic'},
    {'valence': 0.60, 'energy': 0.88, 'danceability': 0.84, 'acousticness': 0.10, 'true_emotion': 'energetic'},
    {'valence': 0.62, 'energy': 0.91, 'danceability': 0.86, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.65, 'energy': 0.89, 'danceability': 0.85, 'acousticness': 0.08, 'true_emotion': 'energetic'},
    {'valence': 0.63, 'energy': 0.90, 'danceability': 0.86, 'acousticness': 0.09, 'true_emotion': 'energetic'},
    {'valence': 0.68, 'energy': 0.93, 'danceability': 0.88, 'acousticness': 0.06, 'true_emotion': 'energetic'},
    
    # Calm 곡들 (25곡)
    {'valence': 0.50, 'energy': 0.20, 'danceability': 0.35, 'acousticness': 0.80, 'true_emotion': 'calm'},
    {'valence': 0.45, 'energy': 0.25, 'danceability': 0.32, 'acousticness': 0.75, 'true_emotion': 'calm'},
    {'valence': 0.52, 'energy': 0.22, 'danceability': 0.30, 'acousticness': 0.82, 'true_emotion': 'calm'},
    {'valence': 0.48, 'energy': 0.18, 'danceability': 0.28, 'acousticness': 0.85, 'true_emotion': 'calm'},
    {'valence': 0.53, 'energy': 0.23, 'danceability': 0.33, 'acousticness': 0.78, 'true_emotion': 'calm'},
    {'valence': 0.47, 'energy': 0.21, 'danceability': 0.31, 'acousticness': 0.81, 'true_emotion': 'calm'},
    {'valence': 0.51, 'energy': 0.24, 'danceability': 0.34, 'acousticness': 0.79, 'true_emotion': 'calm'},
    {'valence': 0.49, 'energy': 0.19, 'danceability': 0.29, 'acousticness': 0.83, 'true_emotion': 'calm'},
    {'valence': 0.54, 'energy': 0.26, 'danceability': 0.36, 'acousticness': 0.76, 'true_emotion': 'calm'},
    {'valence': 0.46, 'energy': 0.20, 'danceability': 0.30, 'acousticness': 0.82, 'true_emotion': 'calm'},
    {'valence': 0.50, 'energy': 0.22, 'danceability': 0.32, 'acousticness': 0.80, 'true_emotion': 'calm'},
    {'valence': 0.48, 'energy': 0.24, 'danceability': 0.34, 'acousticness': 0.78, 'true_emotion': 'calm'},
    {'valence': 0.52, 'energy': 0.21, 'danceability': 0.31, 'acousticness': 0.81, 'true_emotion': 'calm'},
    {'valence': 0.47, 'energy': 0.19, 'danceability': 0.29, 'acousticness': 0.84, 'true_emotion': 'calm'},
    {'valence': 0.51, 'energy': 0.23, 'danceability': 0.33, 'acousticness': 0.79, 'true_emotion': 'calm'},
    {'valence': 0.49, 'energy': 0.25, 'danceability': 0.35, 'acousticness': 0.77, 'true_emotion': 'calm'},
    {'valence': 0.53, 'energy': 0.20, 'danceability': 0.30, 'acousticness': 0.82, 'true_emotion': 'calm'},
    {'valence': 0.46, 'energy': 0.22, 'danceability': 0.32, 'acousticness': 0.80, 'true_emotion': 'calm'},
    {'valence': 0.50, 'energy': 0.24, 'danceability': 0.34, 'acousticness': 0.78, 'true_emotion': 'calm'},
    {'valence': 0.48, 'energy': 0.21, 'danceability': 0.31, 'acousticness': 0.81, 'true_emotion': 'calm'},
    {'valence': 0.52, 'energy': 0.23, 'danceability': 0.33, 'acousticness': 0.79, 'true_emotion': 'calm'},
    {'valence': 0.47, 'energy': 0.19, 'danceability': 0.29, 'acousticness': 0.83, 'true_emotion': 'calm'},
    {'valence': 0.51, 'energy': 0.25, 'danceability': 0.35, 'acousticness': 0.77, 'true_emotion': 'calm'},
    {'valence': 0.49, 'energy': 0.20, 'danceability': 0.30, 'acousticness': 0.82, 'true_emotion': 'calm'},
    {'valence': 0.50, 'energy': 0.22, 'danceability': 0.32, 'acousticness': 0.80, 'true_emotion': 'calm'},
]

def evaluate_emotion_classifier():
    """음악 감정 분류 모델 평가"""
    
    print("=" * 70)
    print("🎵 음악 감정 분류 모델 평가")
    print("=" * 70)
    
    # 분류기 초기화
    classifier = MusicEmotionClassifier()
    
    # 실제 라벨과 예측 라벨 수집
    y_true = []
    y_pred = []
    
    print("\n📋 개별 예측 결과:")
    print("-" * 70)
    
    for i, track in enumerate(test_data, 1):
        true_emotion = track['true_emotion']
        y_true.append(true_emotion)
        
        audio_features = {
            'valence': track['valence'],
            'energy': track['energy'],
            'danceability': track['danceability'],
            'acousticness': track['acousticness']
        }
        predicted_emotion = classifier.classifyEmotion(audio_features)
        y_pred.append(predicted_emotion)
        
        status = '✅' if true_emotion == predicted_emotion else '❌'
        print(f"{i:3d}. True: {true_emotion:10s} | Pred: {predicted_emotion:10s} {status}")
    
    print("=" * 70)
    
    # F1-Score 계산
    f1_macro = f1_score(y_true, y_pred, average='macro')
    f1_weighted = f1_score(y_true, y_pred, average='weighted')
    
    print(f"\n📊 전체 성능 지표")
    print("-" * 70)
    print(f"Macro F1-Score:    {f1_macro:.4f} ({f1_macro*100:.2f}%)")
    print(f"Weighted F1-Score: {f1_weighted:.4f} ({f1_weighted*100:.2f}%)")
    
    # 정확도
    correct = sum([1 for t, p in zip(y_true, y_pred) if t == p])
    accuracy = correct / len(y_true)
    print(f"전체 정확도:       {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"정답/전체:         {correct}/{len(y_true)}")
    
    # 클래스별 상세 리포트
    print(f"\n📋 클래스별 상세 리포트")
    print("=" * 70)
    print(classification_report(y_true, y_pred, 
                                target_names=['calm', 'energetic', 'happy', 'sad'],
                                digits=4))
    
    # Confusion Matrix
    print(f"🔢 Confusion Matrix")
    print("=" * 70)
    cm = confusion_matrix(y_true, y_pred, 
                         labels=['happy', 'sad', 'energetic', 'calm'])
    
    print("\n              Predicted")
    print("                Happy    Sad  Energetic  Calm")
    emotions = ['Happy', 'Sad', 'Energetic', 'Calm']
    for i, emotion in enumerate(emotions):
        print(f"Actual {emotion:10s}    {cm[i][0]:3d}    {cm[i][1]:3d}      {cm[i][2]:3d}     {cm[i][3]:3d}")
    
    print("\n" + "=" * 70)
    print("✅ 평가 완료!")
    print("=" * 70)
    
    return {
        'f1_macro': f1_macro,
        'f1_weighted': f1_weighted,
        'accuracy': accuracy
    }

if __name__ == '__main__':
    results = evaluate_emotion_classifier()