import os
import ffmpy

for root, _, files in os.walk("D:\管道视频"):
     for file in files:
          # 需要转换格式的视频文件，文件真实存在
          source_file = os.path.join(root, file)
          # 转换成功后的视频文件，文件夹真实存在，不会自动创建
          sink_file = os.path.join(root, file.replace(".avi", ".mp4"))

          ff = ffmpy.FFmpeg(
               inputs = {source_file: None},
               outputs = {sink_file: None})
          ff.run()

