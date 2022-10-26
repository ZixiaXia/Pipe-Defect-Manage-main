import glob
import random
import json
import os
import six

import cv2
import numpy as np
from tqdm import tqdm
from time import time
from unet import unet_mini,unet_attention,unet_F_B_A
from data_loader import get_image_array, get_segmentation_array,\
    DATA_LOADER_SEED, class_colors, get_pairs_from_paths
from keras import backend as K
random.seed(DATA_LOADER_SEED)
n_classes = 5
input_height = 256
input_width = 256
output_height = input_height
output_width = input_width
colors=[(0,0,0),(249, 7, 30), (4, 234,255),(0,0,255),(155,231,64)]#(b,g,r)
IMAGE_ORDERING=K.image_data_format()

def predict(model=None, inp=None, out_fname=None,
            checkpoints_path=None, overlay_img=False,
            class_names=None, show_legends=False, colors=class_colors,
            prediction_width=None, prediction_height=None,n_classes=None):


    if isinstance(inp, six.string_types):
        inp = cv2.imread(inp)

    assert len(inp.shape) == 3, "Image should be h,w,3 "

    output_width = 256
    output_height = 256
    input_width = 256
    input_height = 256
    # n_classes = model.n_classes
    x = get_image_array(inp, input_width, input_height,
                        ordering=IMAGE_ORDERING)
    pr = model.predict(np.array([x]))[0]
    pr = pr.reshape((output_height,  output_width, n_classes)).argmax(axis=2)
    return pr


def evaluate(model=None, inp_images_dir=None, annotations_dir=None, n_classes=None, input_height=256, input_width =256):   

    
    paths = get_pairs_from_paths(inp_images_dir, annotations_dir)
    paths = list(zip(*paths))
    inp_images = list(paths[0])
    annotations = list(paths[1])



    tp = np.zeros(n_classes)
    fp = np.zeros(n_classes)
    fn = np.zeros(n_classes)
    n_pixels = np.zeros(n_classes)

    for inp, ann in tqdm(zip(inp_images, annotations)):
        pr = predict(model, inp,n_classes=n_classes)
        gt = get_segmentation_array(ann, n_classes,
                                    256, 256,
                                    no_reshape=True)
        gt = gt.argmax(-1)
        pr = pr.flatten()
        gt = gt.flatten()

        for cl_i in range(n_classes):

            tp[cl_i] += np.sum((pr == cl_i) * (gt == cl_i))
            fp[cl_i] += np.sum((pr == cl_i) * ((gt != cl_i)))
            fn[cl_i] += np.sum((pr != cl_i) * ((gt == cl_i)))
            n_pixels[cl_i] += np.sum(gt == cl_i)

    cl_wise_score = tp / (tp + fp + fn + 0.000000000001)
    # n_pixels_norm = n_pixels / np.sum(n_pixels)
    # frequency_weighted_IU = np.sum(cl_wise_score*n_pixels_norm)
    mean_IU = np.mean(cl_wise_score)
    print("mean_IU........................................")
    print(str(mean_IU))
    return {"mean_IU": mean_IU}