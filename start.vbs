Set WS=CreateObject("WScript.Shell")
current_path=CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WS.Run current_path & "/manage/manage.exe runserver 127.0.0.1:4399",0 '0表示隐藏控制台，后台运行
