import os

import tensorflow as tf
from keras import layers, models

# 1. PREVENT EXTRA LOGS (Optional)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# 2. LOAD DATA (This creates the 'train_ds' reference)
data_dir = "dataset/train/asl_alphabet_train/asl_alphabet_train"

train_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=(64, 64),
    batch_size=32
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=(64, 64),
    batch_size=32
)

# 3. DEFINE THE MODEL (This creates the 'model' reference!)
# This is the part you were likely missing above your fit() call.
model = models.Sequential([
    layers.Rescaling(1./255, input_shape=(64, 64, 3)),
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(29, activation='softmax')
])

# 4. COMPILE THE MODEL
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=['accuracy']
)


# 5. START TRAINING (Now 'model' and 'train_ds' are resolved!)
print("Starting training process...")
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5
)

# 6. SAVE
model.save('asl_model.h5')
print("Finished! Your model is saved as asl_model.h5")
