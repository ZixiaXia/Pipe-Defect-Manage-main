
from keras.models import *
from keras.layers import *
from keras import backend as K
from types import MethodType
from attention_module import attach_attention_module

# from config import IMAGE_ORDERING
# import model_utils
# from model_utils import get_segmentation_model
# from vgg16 import get_vgg_encoder
# from mobilenet import get_mobilenet_encoder
# from basic_models import vanilla_encoder
# from resnet50 import get_resnet50_encoder

IMAGE_ORDERING=K.image_data_format()

if K.image_data_format() == 'channels_first':
    MERGE_AXIS = 1
elif K.image_data_format() == 'channels_last':
    MERGE_AXIS = -1
def get_segmentation_model(input, output):

    img_input = input
    o = output

    o_shape = Model(img_input, o).output_shape
    i_shape = Model(img_input, o).input_shape

    if IMAGE_ORDERING == 'channels_first':
        output_height = o_shape[2]
        output_width = o_shape[3]
        input_height = i_shape[2]
        input_width = i_shape[3]
        n_classes = o_shape[1]
        o = (Reshape((-1, output_height*output_width)))(o)
        o = (Permute((2, 1)))(o)
    elif IMAGE_ORDERING == 'channels_last':
        output_height = o_shape[1]
        output_width = o_shape[2]
        input_height = i_shape[1]
        input_width = i_shape[2]
        n_classes = o_shape[3]
        o = (Reshape((output_height*output_width, -1)))(o)

    o = (Activation('softmax'))(o)
    model = Model(img_input, o)
    # model.output_width = output_width
    # model.output_height = output_height
    # model.n_classes = n_classes
    # model.input_height = input_height
    # model.input_width = input_width
    # model.model_name = ""

    # model.train = MethodType(train, model)
    # model.predict_segmentation = MethodType(predict, model)
    # model.predict_multiple = MethodType(predict_multiple, model)
    # model.evaluate_segmentation = MethodType(evaluate, model)

    return model

def get_crop_shape(target, refer):
        # width, the 3rd dimension
    print(target.get_shape)
    cw = (target.get_shape()[2] - refer.get_shape()[2]).value
    assert (cw >= 0)
    if cw % 2 != 0:
        cw1, cw2 = int(cw / 2), int(cw / 2) + 1
    else:
        cw1, cw2 = int(cw / 2), int(cw / 2)
        # height, the 2nd dimension
    ch = (target.get_shape()[1] - refer.get_shape()[1]).value
    assert (ch >= 0)
    if ch % 2 != 0:
        ch1, ch2 = int(ch / 2), int(ch / 2) + 1
    else:
        ch1, ch2 = int(ch / 2), int(ch / 2)
    return (ch1, ch2), (cw1, cw2)


def unet_mini(n_classes, input_height=360, input_width=480):

    if K.image_data_format() == 'channels_first':
        img_input = Input(shape=(3, input_height, input_width))
    elif K.image_data_format() == 'channels_last':
        img_input = Input(shape=(input_height, input_width, 3))

    conv1 = Conv2D(32, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(img_input)
    conv1 = Dropout(0.2)(conv1)
    conv1 = Conv2D(32, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(conv1)
    pool1 = MaxPooling2D((2, 2), data_format=IMAGE_ORDERING)(conv1)

    conv2 = Conv2D(64, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(pool1)
    conv2 = Dropout(0.2)(conv2)
    conv2 = Conv2D(64, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(conv2)
    pool2 = MaxPooling2D((2, 2), data_format=IMAGE_ORDERING)(conv2)

    conv3 = Conv2D(128, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(pool2)
    conv3 = Dropout(0.2)(conv3)
    conv3 = Conv2D(128, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(conv3)

    up1 = concatenate([UpSampling2D((2, 2), data_format=IMAGE_ORDERING)(
        conv3), conv2], axis=MERGE_AXIS)
    conv4 = Conv2D(64, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(up1)
    conv4 = Dropout(0.2)(conv4)
    conv4 = Conv2D(64, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(conv4)

    up2 = concatenate([UpSampling2D((2, 2), data_format=IMAGE_ORDERING)(
        conv4), conv1], axis=MERGE_AXIS)
    conv5 = Conv2D(32, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(up2)
    conv5 = Dropout(0.2)(conv5)
    conv5 = Conv2D(32, (3, 3), data_format=IMAGE_ORDERING,
                   activation='relu', padding='same')(conv5)

    o = Conv2D(n_classes, (1, 1), data_format=IMAGE_ORDERING,
               padding='same')(conv5)

    model = get_segmentation_model(img_input, o)
    model.model_name = "unet_mini"
    return model

def unet_attention(n_classes, input_height=360, input_width=480):
    if K.image_data_format() == 'channels_first':
        img_input = Input(shape=(3, input_height, input_width))
    elif K.image_data_format() == 'channels_last':
        img_input = Input(shape=(input_height, input_width, 3))
    attention_module = 'se_block'
    concat_axis=3
    conv1 = Conv2D(32, (3, 3), activation='relu', padding='same')(img_input)
    conv_1 = Conv2D(32, (3, 3), activation='relu', padding='same')(conv1)
    pool1 = MaxPooling2D(pool_size=(2, 2))(conv_1)
    conv2_1 = Conv2D(64, (3, 3), activation='relu', padding='same')(pool1)
    conv2 = Conv2D(64, (3, 3), activation='relu', padding='same')(conv2_1)
    pool2 = MaxPooling2D(pool_size=(2, 2))(conv2)

    conv3_1 = Conv2D(128, (3, 3), activation='relu', padding='same')(pool2)
    conv3 = Conv2D(128, (3, 3), activation='relu', padding='same')(conv3_1)
    pool3 = MaxPooling2D(pool_size=(2, 2))(conv3)

    conv4 = Conv2D(256, (3, 3), activation='relu', padding='same')(pool3)
    conv4 = Conv2D(256, (3, 3), activation='relu', padding='same')(conv4)
    pool4 = MaxPooling2D(pool_size=(2, 2))(conv4)

    conv5 = Conv2D(512, (3, 3), activation='relu', padding='same')(pool4)
    conv5 = Conv2D(512, (3, 3), activation='relu', padding='same')(conv5)

    conv5 = attach_attention_module(conv5, attention_module)

    up_conv5 = UpSampling2D(size=(2, 2))(conv5)
    # ch, cw = get_crop_shape(conv4, up_conv5)
    # crop_conv4 = Cropping2D(cropping=(ch, cw))(conv4)
    up6 = concatenate([up_conv5, conv4], axis=concat_axis)
    conv6 = Conv2D(256, (3, 3), padding='same')(up6)
    conv6 = BatchNormalization(axis=1)(conv6)
    conv6 = Activation('relu')(conv6)
    conv6 = Conv2D(256, (3, 3), padding='same')(conv6)
    conv6 = BatchNormalization(axis=1)(conv6)
    conv6 = Activation('relu')(conv6)

    up_conv6 = UpSampling2D(size=(2, 2))(conv6)
    conv_3 = concatenate([conv3_1, conv3], axis=concat_axis)
    conv_3 = attach_attention_module(conv_3, attention_module)
    conv_3 = Conv2D(128, (3, 3), activation='relu', padding='same')(conv_3)

    # ch, cw = get_crop_shape(conv_3, up_conv6)
    # crop_conv3 = Cropping2D(cropping=(ch, cw))(conv_3)
    up7 = concatenate([up_conv6, conv_3], axis=concat_axis)
    conv7 = Conv2D(128, (3, 3), padding='same')(up7)
    conv7 = BatchNormalization(axis=1)(conv7)
    conv7 = Activation('relu')(conv7)
    conv7 = Conv2D(128, (3, 3), padding='same')(conv7)
    conv7 = BatchNormalization(axis=1)(conv7)
    conv7 = Activation('relu')(conv7)

    up_conv7 = UpSampling2D(size=(2, 2))(conv7)
    conv_2 = concatenate([conv2_1, conv2], axis=concat_axis)
    conv_2 = attach_attention_module(conv_2, attention_module)
    conv_2 = Conv2D(64, (3, 3), activation='relu', padding='same')(conv_2)


    # ch, cw = get_crop_shape(conv_2, up_conv7)
    # crop_conv2 = Cropping2D(cropping=(ch, cw))(conv_2)
    up8 = concatenate([up_conv7, conv_2], axis=concat_axis)
    conv8 = Conv2D(64, (3, 3), padding='same')(up8)
    conv8 = BatchNormalization(axis=1)(conv8)
    conv8 = Activation('relu')(conv8)
    conv8 = Conv2D(64, (3, 3), padding='same')(conv8)
    conv8 = BatchNormalization(axis=1)(conv8)
    conv8 = Activation('relu')(conv8)

    up_conv8 = UpSampling2D(size=(2, 2))(conv8)
    conv_1 = concatenate([conv_1, conv1], axis=concat_axis)
    conv_1 = attach_attention_module(conv_1, attention_module)
    conv_1 = Conv2D(32, (3, 3), activation='relu', padding='same')(conv_1)
    # conv_1=attach_attention_module(conv_1, attention_module)

    # ch, cw = get_crop_shape(conv_1, up_conv8)
    # crop_conv1 = Cropping2D(cropping=(ch, cw))(conv_1)

    up9 = concatenate([up_conv8, conv_1], axis=concat_axis)
    conv9 = Conv2D(32, (3, 3), padding='same')(up9)
    conv9 = BatchNormalization(axis=1)(conv9)
    conv9 = Activation('relu')(conv9)
    conv9 = Conv2D(32, (3, 3), padding='same')(conv9)
    conv9 = BatchNormalization(axis=1)(conv9)
    conv9 = Activation('relu')(conv9)

    # ch, cw = get_crop_shape(inputs, conv9)
    # conv9 = ZeroPadding2D(padding=((ch[0], ch[1]), (cw[0], cw[1])))(conv9)
    o = Conv2D(n_classes, (1, 1), data_format=IMAGE_ORDERING,
               padding='same')(conv9)

    model = get_segmentation_model(img_input, o)
    model.model_name = "unet_attention"
    return model