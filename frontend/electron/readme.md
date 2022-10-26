1.首先打包react：npm run build

2.将本文件夹下的`main.js package.json` 移动至打包后的build/

3.进入build/ 并运行命令：`electron-packager . browser --win --out=release --arch=x64 --app-version=1.0.0 --electron-version=11.3.0 --overwrite --icon=./favicon.ico`