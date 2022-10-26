# Pipe-Defect-Manage

一个排水管道缺陷管理系统。

#### 功能

* [x] 统计
* [x] 工程管理
* [x] 管线管理
* [x] 管点管理
* [x] 缺陷管理
* [x] 报告自动生成
* [x] 缺陷标注
* [x] 自动检测（语义分割、分类）
* [x] bounding box标注
* [ ] 语义分割标注（SVG形式存储）

#### 技术

- django
- react
- antd
- axios
- sqlite3
- pyinstaller

#### 打包发布

- manage.spec: pyinstaller manage.spec

- generate react exe: [frontend/electron/readme.md](frontend/electron/readme.md)

#### 其它

- 因浏览器安全限制，部分功能需electron打包才能使用。

- 运行django并隐藏CMD窗口：start.bat & start.vbs 

#### 更新日志

`2022-`:不再需要手动输入文件路径