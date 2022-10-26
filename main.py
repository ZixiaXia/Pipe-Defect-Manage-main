import subprocess
import psutil
import time
import os

'''
main()里的django运行后会打开控制台，因此使用start.vbs隐式打开django
'''


def main():
    # 运行打包后的django.
    server_process = subprocess.Popen('./manage/manage.exe runserver 127.0.0.1:4399')
    # 运行electron打包的react.
    browser_process = subprocess.Popen('./browser-win32-x64/browser.exe')
    # 如果关闭了browser，则关闭服务器
    while True:
        # 获取进程状态，None表示还在运行.
        poll = browser_process.poll()
        if poll is not None:
            # 关闭server_process的子进程，即manage.py runserver.
            for child in psutil.Process(server_process.pid).children():
                child.kill()
            server_process.kill()
            break
        time.sleep(3)

#如果pyinstaller -w,则无法运行subprocess，因为其要显式处理stdin,stdout等
def myRun(cmd):
    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    process = subprocess.run(cmd, startupinfo=startupinfo, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
    return process.stdout

def main2():
    server_process = subprocess.Popen(['cscript.exe', "start.vbs"])
    browser_process = subprocess.Popen('./browser-win32-x64/browser.exe')
    while True:
        # 获取进程状态，None表示还在运行.
        poll = browser_process.poll()
        if poll is not None:
            # 杀掉所有python程序
            result = str(myRun('tasklist'))
            result = result.split('\\n')
            res = []
            for i in result:
                if 'manage' in i:
                    res.append(i)
            # result = os.popen('tasklist | findstr manage').read()
            pids = [int(line.split()[1]) for line in res]
            for pid in pids:
                try:
                    myRun('taskkill /pid {} /f'.format(pid))
                except:
                    pass
            server_process.kill()
            break
        time.sleep(3)


# pyinstaller -F -w main.py打包
if __name__ == '__main__':
    try:
        main2()
    except Exception as e:
        print(e)
