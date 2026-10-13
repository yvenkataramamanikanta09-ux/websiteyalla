# Sign Language Communication System

A Python prototype that classifies webcam hand images into ASL alphabet labels, builds a text string, and speaks recognized labels. This source snapshot is shared by Yalla Dhattatreya as part of the portfolio.

## Source files

- `train_model.py`: trains a convolutional neural network with TensorFlow/Keras on 64 x 64 RGB images, with an 80/20 training-validation split and five training epochs. Saves `asl_model.h5`.
- `test_webcam.py`: captures a webcam region with OpenCV, predicts a label, appends accepted labels to a text string, and uses `pyttsx3` for speech.
- `requirements.txt`: dependency names inferred from the script imports. The original project did not include a tested version lock.

The two Python files are copies of the owner's existing source, not a rewritten or independently validated model. The empty `detect_sign.py`, IDE configuration, datasets, and trained weights are intentionally not published. The original local project is unchanged.

## Local setup

Use a Python environment compatible with your chosen TensorFlow release. From this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

To train, obtain an appropriately licensed ASL alphabet image dataset separately and arrange its class folders beneath:

```text
dataset/train/asl_alphabet_train/asl_alphabet_train/
  A/
  B/
  ...
  Z/
  del/
  nothing/
  space/
```

Confirm the dataset's class order matches the hard-coded `labels` list in `test_webcam.py`; the training script expects 29 classes. The dataset is not bundled and no dataset download source or redistribution license was supplied with this snapshot.

```powershell
.\.venv\Scripts\python.exe train_model.py
.\.venv\Scripts\python.exe test_webcam.py
```

Run the webcam script from this directory after `asl_model.h5` is present. It opens the default camera and can play speech through your speakers. Put a hand inside the displayed rectangle; press **C** to clear the text and **Q** to quit. Do not run it without a working webcam and the required model file.

## Scope and limitations

- This is a local Python prototype, not a browser-hosted demo or a complete sign-language translator.
- A prediction must exceed the configured 0.90 confidence threshold and remain stable for about one second before being accepted. This threshold is **not** a measured 90% accuracy result. No evaluation report is included.
- The original webcam script passes OpenCV BGR images to a model trained on RGB images. Preprocessing and label order should be checked before evaluating or relying on predictions.
- The webcam region and overlay use fixed coordinates. Camera resolution, lighting, background, and repeated held gestures can affect behavior.
- Text-to-speech support depends on the local operating system and available speech engine. The prototype is not validated for accessibility-critical use.

Only Python syntax was checked when publishing this snapshot. Model training, camera capture, speech, and recognition accuracy were not run or verified.
