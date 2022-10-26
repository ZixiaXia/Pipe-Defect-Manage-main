# PipeDefectManage

An AI-based sewer pipe inspection system.

#### Features

* [x] statistics
* [x] project management
* [x] pipe line management
* [x] pipe point management
* [x] deficit management
* [x] automatic generation of report
* [x] deficit annotation
* [x] automatic detection（semantic segmentation - PipeUNet, classification, localization - YOLO v5）
* [x] annotation of bounding box
* [ ] annotation of segmentation（saved as SVG）

#### Tech

- django
- react
- antd
- axios
- sqlite3
- pyinstaller

#### Publish

- manage.spec: pyinstaller manage.spec

- generate react exe: [frontend/electron/readme.md](frontend/electron/readme.md)

#### Others

- Limited by the browser safaty mechanism, some features could only be available after published (such as reading video path from local file system).

- Run Django and get CMD hidden：start.bat & start.vbs 

#### Update log

`2022-`: no longer need to manually type video path
