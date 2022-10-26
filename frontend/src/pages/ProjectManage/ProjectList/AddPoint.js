import React from "react";
import 'antd/dist/antd.css';
import request from '../../../request'
import {useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import {
    Form,
    Input,
    Button,
    message,
    DatePicker,
    Card,
    InputNumber,
    Select,
    Affix,
    Row,
    Col, Breadcrumb
} from 'antd'

const {Option} = Select;

message.config({
    top: 200
});

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 5,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 10,
            offset: 12,
        },
    },
};


const AddPoint = () => {
    const history = useHistory();
    const location = useLocation();//获取前一页面history传递的参数
    const [form] = Form.useForm();//对表单数据域进行交互
    try {
        if (location.state.initialization) {
            location.state.initialization = false;
            if (location.state.isEdit) {
                request({
                    method: 'post',
                    url: 'get_point/',
                    data: {
                        "condition": "point_id",
                        "point_id": location.state.point_id
                    },
                }).then(function (response) {
                    if (response.data.code === 0) {
                        form.setFieldsValue({
                            point_name: response.data.list[0]['fields']['point_name'],
                            feature: response.data.list[0]['fields']['feature'],
                            attachment: response.data.list[0]['fields']['attachment'],
                            height: response.data.list[0]['fields']['height'],
                            feature_category: response.data.list[0]['fields']['feature_category'],
                            x_coordinate: response.data.list[0]['fields']['x_coordinate'],
                            y_coordinate: response.data.list[0]['fields']['y_coordinate'],
                            depth: response.data.list[0]['fields']['depth'],
                            road_where: response.data.list[0]['fields']['road_where'],
                            build_year: response.data.list[0]['fields']['build_year'],
                            ownership: response.data.list[0]['fields']['ownership'],
                            detection_unit: response.data.list[0]['fields']['detection_unit'],
                            supervisor_unit: response.data.list[0]['fields']['supervisor_unit'],
                            state: response.data.list[0]['fields']['state'],
                            precision_level: response.data.list[0]['fields']['precision_level'],
                            remark: response.data.list[0]['fields']['remark'],
                        });
                        if (response.data.list[0]['fields']['detection_date'].length > 0) {
                            form.setFieldsValue({detection_date: moment(response.data.list[0]['fields']['detection_date'], 'YYYY-MM-DD')})
                        }
                    } else {
                        message.error('获取管点失败:' + response.data.msg, 3)
                    }
                }).catch(function (error) {
                    message.error(error);
                });
            }
        }
    } catch (e) {
        history.push('/ProjectManage/ProjectList')
    }

    /*三个点用于取出对象中的内容*/
    const onFinish = (values) => {
        //解决时间少8个小时的问题
        values.detection_date = values.detection_date != null ? moment(values.detection_date).format("YYYY-MM-DD") : "";
        let data = {"isEdit": false, "line_id": location.state.line_id, "values": values};
        if (location.state.isEdit) {
            data = {"isEdit": true, "values": values, "point_id": location.state.point_id}
        }
        request({
            method: 'post',
            url: 'add_point/',
            data: data,
        }).then(function (response) {
            if (response.data.code === 0) {
                if (location.state.isEdit) {
                    message.success('修改成功', 3);
                } else {
                    message.success('添加成功', 3);
                    history.push({
                        pathname: '/ProjectManage/PointList',
                        state: {
                            isEdit: false,
                            project_id: location.state.project_id,
                            line_id: location.state.line_id,
                            initialization: true
                        }
                    })
                }
            } else {
                message.error('添加失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error(error);
        });
    };

    return (
        <>
            <div style={{marginBottom: 10}}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push('/')
                        }}>主页</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push('/ProjectManage/ProjectList')
                        }}>工程列表</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push({
                                pathname: '/ProjectManage/LineList',
                                state: {project_id: location.state.project_id, initialization: true}
                            })
                        }}>管线列表</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push({
                                pathname: '/ProjectManage/PointList',
                                state: {
                                    project_id: location.state.project_id,
                                    line_id: location.state.line_id,
                                    initialization: true
                                }
                            })
                        }}>管点列表</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{() => {
                        try {
                            return location.state.isEdit ? "修改管点" : "添加管点";
                        } catch (e) {
                            history.push('/ProjectManage/ProjectList')
                        }
                    }}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Card>
                <Form
                    {...formItemLayout}
                    form={form}
                    scrollToFirstError
                    onFinish={onFinish}
                    size='default'
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="管线点编号" name="point_name" rules={[{required: true, message: '不能为空'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="管线点特征" name="feature">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="管线附属物" name="attachment">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="点地面高程" name="height" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="要素类别" name="feature_category"
                                       rules={[{required: true, message: '不能为空'}]}>
                                <Select>
                                    <Option value="雨水">雨水</Option>
                                    <Option value="污水">污水</Option>
                                    <Option value="合流">合流</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="X坐标" name="x_coordinate" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Y坐标" name="y_coordinate" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="井底埋深" name="depth" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="所在道路" name="road_where">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="埋设年代" name="build_year">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="权属单位" name="ownership">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="探测日期" name="detection_date">
                                <DatePicker placeholder="选择日期"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="探测单位" name="detection_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="监理单位" name="supervisor_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="状态" name="state">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="精度级别" name="precision_level">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="备注" name="remark">
                                <Input.TextArea autoSize={{minRows: 1}}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item {...tailFormItemLayout}>
                        <Affix offsetBottom={10}>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button onClick={() => {
                                history.push({
                                    pathname: '/ProjectManage/PointList',
                                    state: {
                                        project_id: location.state.project_id,
                                        line_id: location.state.line_id,
                                        initialization: true
                                    }
                                })
                            }}>
                                返回
                            </Button>
                        </Affix>
                    </Form.Item>
                </Form>
            </Card>
        </>
    )
};

export default AddPoint;
