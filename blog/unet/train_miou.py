import json
from data_loader import image_segmentation_generator, \
    verify_segmentation_dataset
import glob
import six
import tensorflow as tf
from keras import backend as K
from keras.callbacks import Callback
from unet import unet_mini,unet_attention,unet_F_B_A
from keras import optimizers
from keras.optimizers import Adam
from keras.callbacks import ModelCheckpoint, TensorBoard,LambdaCallback,CSVLogger,LearningRateScheduler
import numpy as np
# from predict import evaluate as e_miou
from cal_miou import evaluate as cal_miou
import os



# def focal_loss(y_true, y_pred):
#     # gamma=0.75
#     gamma=2
#     alpha=0.25
#     pt_1 = tf.where(tf.equal(y_true, 1), y_pred, tf.ones_like(y_pred))
#     pt_0 = tf.where(tf.equal(y_true, 0), y_pred, tf.zeros_like(y_pred))
#     pt_1 = K.clip(pt_1, 1e-3, .999)
#     pt_0 = K.clip(pt_0, 1e-3, .999)
#     return -K.sum(alpha * K.pow(1. - pt_1, gamma) * K.log(pt_1))-K.sum((1-alpha) * K.pow( pt_0, gamma) * K.log(1. - pt_0))

def focal_loss(y_true, y_pred):
    epsilon = 1.e-7
    gamma = 1.5
    #alpha = tf.constant([[2],[1],[1],[1],[1]], dtype=tf.float32)
    alpha = tf.constant([[1],[2],[2],[2],[2]], dtype=tf.float32)
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.clip_by_value(y_pred, epsilon, 1. - epsilon)
    y_t = tf.multiply(y_true, y_pred) + tf.multiply(1-y_true, 1-y_pred)
    ce = -tf.math.log(y_t)
    weight = tf.pow(tf.subtract(1., y_t), gamma)
    fl = tf.matmul(tf.multiply(weight, ce), alpha)
    loss = tf.reduce_mean(fl)
    return loss

# def focal_loss(y_true, y_pred):
#     epsilon = 1.e-7
#     gamma=2.
#     alpha = tf.constant(0.75, dtype=tf.float32)

#     y_true = tf.cast(y_true, tf.float32)
#     y_pred = tf.clip_by_value(y_pred, epsilon, 1. - epsilon)

#     alpha_t = y_true*alpha + (tf.ones_like(y_true)-y_true)*(1-alpha)
#     y_t = tf.multiply(y_true, y_pred) + tf.multiply(1-y_true, 1-y_pred)
#     ce = -tf.math.log(y_t)
#     weight = tf.pow(tf.subtract(1., y_t), gamma)
#     fl = tf.multiply(tf.multiply(weight, ce), alpha_t)
#     loss = tf.reduce_mean(fl)
#     return loss


def find_latest_checkpoint(checkpoints_path, fail_safe=True):

    def get_epoch_number_from_path(path):
        return path.replace(checkpoints_path, "").strip(".")

    # Get all matching files
    all_checkpoint_files = glob.glob(checkpoints_path + ".*")
    # Filter out entries where the epoc_number part is pure number
    all_checkpoint_files = list(filter(lambda f: get_epoch_number_from_path(f)
                                       .isdigit(), all_checkpoint_files))
    if not len(all_checkpoint_files):
        # The glob list is empty, don't have a checkpoints_path
        if not fail_safe:
            raise ValueError("Checkpoint path {0} invalid"
                             .format(checkpoints_path))
        else:
            return None

    # Find the checkpoint file with the maximum epoch
    latest_epoch_checkpoint = max(all_checkpoint_files,
                                  key=lambda f:
                                  int(get_epoch_number_from_path(f)))
    return latest_epoch_checkpoint


def masked_categorical_crossentropy(gt, pr):
    from keras.losses import categorical_crossentropy
    mask = 1 - gt[:, :, 0]
    return categorical_crossentropy(gt, pr) * mask


class CheckpointsCallback(Callback):
    def __init__(self, checkpoints_path):
        self.checkpoints_path = checkpoints_path

    def on_epoch_end(self, epoch, logs=None):
        if self.checkpoints_path is not None:
            self.model.save_weights(self.checkpoints_path + "." + str(epoch))
            print("saved ", self.checkpoints_path + "." + str(epoch))

train_images="/home/data_disk/zyx/unet_data/mul_defect_dataset/train_img/" 
train_annotations="/home/data_disk/zyx/unet_data/mul_defect_dataset/train_Label/"
val_images= "/home/data_disk/zyx/unet_data/mul_defect_dataset/val_img/"
val_annotations= "/home/data_disk/zyx/unet_data/mul_defect_dataset/val_Label/"
checkpoints_path='output'
batch_size=5
val_batch_size=5 
n_classes = 5
input_height = 256
input_width = 256
output_height = input_height
output_width = input_width
model = unet_attention(n_classes, input_height=input_height, input_width=input_width)
loss_k = 'categorical_crossentropy'
# optimizer=Adam(lr=0.001)
model.compile(loss=focal_loss, optimizer=Adam(lr=0.0001),metrics=['accuracy'])
# model.compile(loss=loss_k, optimizer=Adam(lr=0.0001),metrics=['accuracy'])
# model.compile(loss=focal_loss, optimizer=Adam(lr=0.0001),metrics=[mean_iou_own])


# checkpoint = ModelCheckpoint(
#     filepath="output/unet_model.h5" ,
#     monitor='val_loss',
#     mode='auto',
#     save_best_only='False')
# m=0

def scheduler(epoch):
    # 每隔100个epoch，学习率减小为原来的1/10
    
    if epoch % 200 == 0 and epoch != 0:
        lr = K.get_value(model.optimizer.lr)
        K.set_value(model.optimizer.lr, lr * 0.9)
        print("lr changed to {}".format(lr * 0.9))
    return K.get_value(model.optimizer.lr)
 
reduce_lr = LearningRateScheduler(scheduler)




# tensorboard = TensorBoard(log_dir='output/log_unet_model')


train_gen = image_segmentation_generator(
        train_images, train_annotations,  batch_size,  n_classes,
        input_height, input_width, output_height, output_width)

val_gen = image_segmentation_generator(
            val_images, val_annotations, val_batch_size,
            n_classes, input_height, input_width, output_height, output_width)


# miou_out=LambdaCallback(on_epoch_end=lambda batch,logs: print(e_miou(model=model, inp_images=None, annotations=None,inp_images_dir=val_images, annotations_dir=val_annotations, n_classes=n_classes)))
# miou_out=LambdaCallback(on_epoch_end=lambda batch,logs: e_miou(model=model, inp_images=None, annotations=None,inp_images_dir=val_images, annotations_dir=val_annotations, n_classes=n_classes))
miou_out=LambdaCallback(on_epoch_end=lambda batch, logs:cal_miou(model=model, inp_images_dir=val_images, annotations_dir=val_annotations, n_classes=n_classes,input_height=256, input_width =256))

save_dir='/home/data_disk/zyx/unet_data/mul_defect_weight'


checkpoint = ModelCheckpoint(
    filepath=os.path.join(save_dir, 'model_pipeunet{epoch:03d}.h5'),period=1,    
    save_best_only=False)

# checkpoint = ModelCheckpoint(
#     filepath=os.path.join(save_dir, 'model_unet_f_b_a.h5'),
#     monitor='val_loss',
#     mode='auto',
#     save_best_only='True')

# checkpoint = ModelCheckpoint(
#     filepath=os.path.join(save_dir, 'model_{logs:03d}.h5'),
#     monitor='val_loss',
#     mode='auto',
#     save_best_only='False')

# history = History()
# csv_logger = CSVLogger('training.txt')
steps_per_epoch=200
val_steps_per_epoch=68
   
model.fit_generator(train_gen,steps_per_epoch,validation_data=val_gen,validation_steps=val_steps_per_epoch,
                            epochs=20000, callbacks=[checkpoint,miou_out,reduce_lr],shuffle=True)

