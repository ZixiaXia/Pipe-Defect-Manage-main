from django.db import models
from django.db.models import IntegerField, FloatField, AutoField, ForeignKey, CharField, PositiveIntegerField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError


class DefectType(models.Model):
    defect_type_id = IntegerField(primary_key = True, auto_created = True)
    defect_type_name = CharField(default = '', max_length = 50)
    defect_default_info = CharField(default = '', max_length = 50)


class DefectGrade(models.Model):
    defect_grade_id = IntegerField(primary_key = True, auto_created = True)
    defect_grade_name = CharField(default = '', max_length = 50)
    defect_type_id = ForeignKey(to = DefectType, on_delete = models.CASCADE)
    score = FloatField(default = 0)


class Staff(models.Model):
    staff_id = AutoField(primary_key = True, auto_created = True)
    staff_name = CharField(default = '', max_length = 50)
    gender = IntegerField(default = 0, validators = [MaxValueValidator(1), MinValueValidator(0)])  # 0-男 1-女
    age = PositiveIntegerField(default = 0)
    unit = CharField(default = '', max_length = 50)  # 单位


class Regional(models.Model):
    regional_id = IntegerField(primary_key = True, auto_created = True)
    regional_info = CharField(default = '', max_length = 50)
    regional_value = IntegerField(default = 0)


class Soil(models.Model):
    soil_id = IntegerField(primary_key = True, auto_created = True)
    soil_info = CharField(default = '', max_length = 50)
    soil_value = IntegerField(default = 0)


class Project(models.Model):
    project_id = IntegerField(primary_key = True, auto_created = True)
    project_no = CharField(default = '', max_length = 50)
    project_name = CharField(default = '', max_length = 50)
    project_address = CharField(default = '', max_length = 50)
    staff = CharField(default = '[]', max_length = 50)  # 记录staff_id数组，默认空数组[]
    start_date = CharField(default = '', max_length = 50)
    report_no = CharField(default = '', max_length = 50)
    requester_unit = CharField(default = '', max_length = 50)
    construction_unit = CharField(default = '', max_length = 50)
    design_unit = CharField(default = '', max_length = 50)
    build_unit = CharField(default = '', max_length = 50)
    supervisory_unit = CharField(default = '', max_length = 50)
    move = CharField(default = '', max_length = 50)
    plugging = CharField(default = '', max_length = 50)
    drainage = CharField(default = '', max_length = 50)
    dredging = CharField(default = '', max_length = 50)
    detection_equipment = CharField(default = '', max_length = 50)
    detection_method = CharField(default = '', max_length = 50)
    description = CharField(default = '', max_length = 50)


class Line(models.Model):
    # line_id = IntegerField(primary_key = True, auto_created = True)
    line_id = AutoField(primary_key=True, auto_created=True)
    project_id = ForeignKey(to = Project, on_delete = models.CASCADE)
    regional_importance_id = ForeignKey(to = Regional, on_delete = models.CASCADE)
    soil_id = ForeignKey(to = Soil, on_delete = models.CASCADE)
    total_length = FloatField(default = 0)
    detection_length = FloatField(default = 0)
    start_number = CharField(default = '', max_length = 50)
    end_number = CharField(default = '', max_length = 50)
    start_height = FloatField(default = 0)
    end_height = FloatField(default = 0)
    start_depth = FloatField(default = 0)
    end_depth = FloatField(default = 0)
    rehabilitation_index = FloatField(default=0)
    maintainance_index = FloatField(default=0)
    start_x_coordinate = FloatField(default = 0)
    start_y_coordinate = FloatField(default = 0)
    end_x_coordinate = FloatField(default = 0)
    end_y_coordinate = FloatField(default = 0)
    flow_direction = IntegerField(default = 0, validators = [MaxValueValidator(1), MinValueValidator(0)])
    type = CharField(default = '', max_length = 50)
    sub_level_type = CharField(default = '', max_length = 50)
    material = CharField(default = '', max_length = 50)
    burial_way = CharField(default = '', max_length = 50)
    diameter = FloatField(default = 0)
    burial_year = IntegerField(default = 0)
    ownership = CharField(default = '', max_length = 50)
    road_where = CharField(default = '', max_length = 50)
    use_state = CharField(default = '', max_length = 50)
    detection_date = CharField(default = '', max_length = 50)
    detection_unit = CharField(default = '', max_length = 50)
    supervisor_unit = CharField(default = '', max_length = 50)
    state = CharField(default = '', max_length = 50)
    precision_level = CharField(default = '', max_length = 50)
    remark = CharField(default = '', max_length = 50)


class Point(models.Model):
    point_id = IntegerField(primary_key = True, auto_created = True)
    line_id = ForeignKey(to = Line, on_delete = models.CASCADE)
    point_name = CharField(default='', max_length=50)
    key = CharField(default='', max_length=50)
    feature = CharField(default = '', max_length = 50)
    attachment = CharField(default = '', max_length = 50)
    height = FloatField(default = 0)
    feature_category = CharField(default = '', max_length = 50)
    x_coordinate = FloatField(default = 0)
    y_coordinate = FloatField(default = 0)
    depth = FloatField(default = 0)
    road_where = CharField(default = '', max_length = 50)
    build_year = IntegerField(default = 0)
    ownership = CharField(default = '', max_length = 50)
    detection_date = CharField(default = '', max_length = 50)
    detection_unit = CharField(default = '', max_length = 50)
    supervisor_unit = CharField(default = '', max_length = 50)
    state = CharField(default = '', max_length = 50)
    precision_level = CharField(default = '', max_length = 50)
    remark = CharField(default = '', max_length = 50)

class Video(models.Model):
    video_id = IntegerField(primary_key = True, auto_created = True)
    project_id = ForeignKey(to = Project, on_delete = models.CASCADE)
    line_id = ForeignKey(to = Line, on_delete = models.CASCADE)
    record_date = CharField(default = '', max_length = 50)
    remark = CharField(default = '', max_length = 50)
    name = CharField(default = '', max_length = 50)
    path = CharField(default = '', max_length = 50)
    import_date = CharField(default = '', max_length = 50)


class Defect(models.Model):
    # 使用AutoField，这样保存模型后能直接获得主键
    defect_id = AutoField(primary_key = True, auto_created = True)
    video_id = ForeignKey(to = Video, on_delete = models.CASCADE)
    time_in_video = CharField(default = '', max_length = 50)
    defect_type_id = ForeignKey(to = DefectType, on_delete = models.CASCADE)
    defect_distance = FloatField(default = 0)
    defect_length = FloatField(default = 0)
    clock_start = IntegerField(default = 1, validators = [MaxValueValidator(12), MinValueValidator(1)])
    clock_end = IntegerField(default = 1, validators = [MaxValueValidator(12), MinValueValidator(1)])
    defect_grade_id = ForeignKey(to = DefectGrade, on_delete = models.CASCADE)
    defect_remark = CharField(default = '', max_length = 50)
    defect_date = CharField(default = '', max_length = 50)
    defect_attribute = CharField(default = '', max_length = 50)


# 限制表格每页只可显示10，20，50或100条数据
def validate_table_rows_per_page(self, value):
    if value not in [10, 20, 50, 100]:
        raise ValidationError('{} is not a legal value.'.format(value))


class Settings(models.Model):
    table_rows_per_page = IntegerField(default = 10, validators = [validate_table_rows_per_page])
    
    # 自定义save，限制表中只能有一条记录
    def save(self, *args, **kwargs):
        if Settings.objects.count() > 0:
            raise Exception('too much rows, only ONE row is allowed.')
        super(Settings, self).save(*args, **kwargs)


# bounding box：(x, y, width, height)，坐标轴原点在左上角
class BBox(models.Model):
    bbox_id = AutoField(primary_key = True, auto_created = True)
    x = IntegerField(default = 0, validators = [MinValueValidator(0)])
    y = IntegerField(default = 0, validators = [MinValueValidator(0)])
    width = IntegerField(default = 0, validators = [MinValueValidator(0)])
    height = IntegerField(default = 0, validators = [MinValueValidator(0)])
    defect_type_id = ForeignKey(to = DefectType, on_delete = models.CASCADE)
    defect_id =  ForeignKey(to = Defect, on_delete = models.CASCADE)