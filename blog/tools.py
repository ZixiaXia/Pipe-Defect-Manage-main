from . import models


# 获取表格每页条数
def get_per_page():
    setting = models.Setting.objects.all()[0]
    per_page = setting.table_rows_per_page
    print(per_page)
    if per_page not in [10, 20, 50, 100]:
        return 10
    return per_page
