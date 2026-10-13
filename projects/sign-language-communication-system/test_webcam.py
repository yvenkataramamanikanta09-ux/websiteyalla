import cv2
import numpy as np
import tensorflow as tf
import time
import pyttsx3
import threading

# --- 1. INITIALIZE VOICE ENGINE ---
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Speed of speech


def speak(text):
    """
    Function to handle text-to-speech in a separate thread.
    This prevents the video frame from freezing while the computer speaks.
    """

    def _say():
        try:
            # Create a fresh local engine reference for the thread to avoid collisions
            local_engine = pyttsx3.init()
            local_engine.say(text)
            local_engine.runAndWait()
            local_engine.stop()
        except RuntimeError:
            pass

    threading.Thread(target=_say, daemon=True).start()


# --- 2. LOAD MODEL ---
# Ensure 'asl_model.h5' is in your Pycharm project folder
model = tf.keras.models.load_model('asl_model.h5')

# Alphabetical labels as per standard dataset structure
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
          'del', 'nothing', 'space']

cap = cv2.VideoCapture(0)

# --- 3. CONFIGURATION ---
sentence = ""
current_sign = ""
start_time = 0
required_duration = 1.0  # Time (seconds) to hold a sign to "type" it
confidence_threshold = 0.90  # Only accept signs with >90% accuracy

print("Starting Error-Free Translator... Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Mirror the frame for easier user interaction
    frame = cv2.flip(frame, 1)

    # --- STEP 1: DEFINE REGION OF INTEREST (ROI) ---
    x, y, w, h = 150, 50, 400, 400
    cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

    # --- STEP 2: PREPROCESS ONLY THE ROI ---
    roi = frame[y:y + h, x:x + w]
    img = cv2.resize(roi, (64, 64))
    img = np.array(img, dtype=np.float32)

    # --- TEST BOTH WAYS HERE ---
    # OPTION A: If you trained WITH rescaling/1.255, keep this line:
    # img = img / 255.0

    # OPTION B: If you trained WITHOUT rescaling, leave 'img' as is (0-255).

    img = np.expand_dims(img, axis=0)

    # --- STEP 3: PREDICTION ---
    predictions = model.predict(img, verbose=0)

    # DEBUG: This prints the raw numbers to your console.
    # If they are all 0.000 except for one 1.000, your model is "Overfitted"
    # print(predictions)

    score = np.max(predictions)
    label = labels[np.argmax(predictions)]

    # --- STEP 4: SPEECH & SPELLING LOGIC ---
    if score > confidence_threshold and label != 'nothing':
        if label == current_sign:
            elapsed_time = time.time() - start_time
            if elapsed_time > required_duration:
                # Sign confirmed: Add to sentence and trigger voice
                if label == 'space':
                    sentence += " "
                    speak("Space")
                elif label == 'del':
                    if len(sentence) > 0:
                        sentence = sentence[:-1]
                        speak("Delete")
                else:
                    sentence += label
                    speak(label)  # Pronounces the letter once added

                # Reset current_sign to wait for the next unique sign movement
                current_sign = ""
        else:
            # New potential sign detected, start the timer
            current_sign = label
            start_time = time.time()
    else:
        # Reset timer if hand is removed or confidence is too low
        current_sign = ""

    # --- STEP 5: VISUAL INTERFACE ---
    # Green text for high confidence, Red for low confidence
    status_color = (0, 255, 0) if score > confidence_threshold else (0, 0, 255)

    cv2.putText(frame, f"Detect: {label} ({score * 100:.1f}%)", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

    # Bottom Sentence Display Bar
    cv2.rectangle(frame, (0, 420), (640, 480), (40, 40, 40), -1)
    cv2.putText(frame, f"TEXT: {sentence}", (20, 460),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

    cv2.imshow('ASL Final Version', frame)

    # Keyboard Controls
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):  # Quit
        break
    if key == ord('c'):  # Clear entire sentence
        sentence = ""

cap.release()
cv2.destroyAllWindows()
