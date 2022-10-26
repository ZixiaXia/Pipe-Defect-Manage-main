import {useHistory, useLocation} from 'react-router-dom';
import request from '../../../request'
import 'antd/dist/antd.css'
import moment from 'moment'
import React, {useState} from "react"
import {List, Avatar, Table, Popconfirm, Typography} from 'antd';
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
    Col,
    Breadcrumb,
    Tooltip,
    Space, Tag, Drawer
} from 'antd'
import {PlusOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import PointEditableTable from "./PointList";
// import DrawerForm from "./TempPointList";

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


const AddLine = () => {
    const history = useHistory();
    const location = useLocation();//获取前一页面history传递的参数
    const [form] = Form.useForm();//对表单数据域进行交互
    const [formTempPoint] = Form.useForm();
    const [pointDrawerVisible, setPointDrawerVisible] = useState(false);
    const [tempPoint, setTempPoint] = useState([]);
    const [pointOption, setPointOption] = useState([]);
    const [currentPoint, setCurrentPoint] = useState([]);
    const [selectStartPoint, setSelectStartPoint] = useState([]);
    const [selectEndPoint, setSelectEndPoint] = useState([]);

    const getPoint = () => {
        request({
            method: 'post',
            url: 'get_point/',
            data: {
                "condition": "all",
                "line_id": location.state.line_id,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let newData = [];
                let option = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    newData.push({
                        key: response.data.list[i]['pk'],
                        point_name: response.data.list[i]['fields']['point_name'],
                        feature: response.data.list[i]['fields']['feature'],
                        attachment: response.data.list[i]['fields']['attachment'],
                        height: response.data.list[i]['fields']['height'],
                        feature_category: response.data.list[i]['fields']['feature_category'],
                        x_coordinate: response.data.list[i]['fields']['x_coordinate'],
                        y_coordinate: response.data.list[i]['fields']['y_coordinate'],
                        depth: response.data.list[i]['fields']['depth'],
                        road_where: response.data.list[i]['fields']['road_where'],
                        build_year: response.data.list[i]['fields']['build_year'],
                        ownership: response.data.list[i]['fields']['ownership'],
                        detection_unit: response.data.list[i]['fields']['detection_unit'],
                        supervisor_unit: response.data.list[i]['fields']['supervisor_unit'],
                        state: response.data.list[i]['fields']['state'],
                        precision_level: response.data.list[i]['fields']['precision_level'],
                        remark: response.data.list[i]['fields']['remark'],
                    });
                    let point_name = response.data.list[i]['fields']['point_name']
                    option.push(<Option value={point_name}>{point_name}</Option>);
                }
                setTempPoint(newData);
                setCurrentPoint(newData);
                setPointOption(option);
            } else {
                message.error('获取失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取失败:', error, 3);
        });
    };

    const getLine = () => {
        request({
            method: 'post',
            url: 'get_line/',
            data: {
                "condition": "line_id",
                "line_id": location.state.line_id
            },
        }).then(function (response) {
            console.log("data: ", response.data)
            if (response.data.code === 0) {
                form.setFieldsValue({
                    start_number: response.data.list[0]['fields']['start_number'],
                    end_number: response.data.list[0]['fields']['end_number'],
                    start_height: response.data.list[0]['fields']['start_height'],
                    end_height: response.data.list[0]['fields']['end_height'],
                    start_depth: response.data.list[0]['fields']['start_depth'],
                    end_depth: response.data.list[0]['fields']['end_depth'],
                    rehabilitation_index: response.data.list[0]['fields']['rehabilitation_index'],
                    maintainance_index: response.data.list[0]['fields']['maintainance_index'],
                    start_x_coordinate: response.data.list[0]['fields']['start_x_coordinate'],
                    start_y_coordinate: response.data.list[0]['fields']['start_y_coordinate'],
                    end_x_coordinate: response.data.list[0]['fields']['end_x_coordinate'],
                    end_y_coordinate: response.data.list[0]['fields']['end_y_coordinate'],
                    total_length: response.data.list[0]['fields']['total_length'],
                    detection_length: response.data.list[0]['fields']['detection_length'],
                    flow_direction: response.data.list[0]['fields']['flow_direction'],
                    sub_level_type: response.data.list[0]['fields']['sub_level_type'],
                    material: response.data.list[0]['fields']['material'],
                    burial_way: response.data.list[0]['fields']['burial_way'],
                    diameter: response.data.list[0]['fields']['diameter'],
                    burial_year: response.data.list[0]['fields']['burial_year'],
                    ownership: response.data.list[0]['fields']['ownership'],
                    road_where: response.data.list[0]['fields']['road_where'],
                    use_state: response.data.list[0]['fields']['use_state'],
                    detection_unit: response.data.list[0]['fields']['detection_unit'],
                    supervisor_unit: response.data.list[0]['fields']['supervisor_unit'],
                    state: response.data.list[0]['fields']['state'],
                    precision_level: response.data.list[0]['fields']['precision_level'],
                    remark: response.data.list[0]['fields']['remark'],
                    regional_importance_id: response.data.list[0]['fields']['regional_importance_id'],
                    soil_id: response.data.list[0]['fields']['soil_id'],
                    type: response.data.list[0]['fields']['type']
                });
                if (response.data.list[0]['fields']['detection_date'].length > 0) {
                    form.setFieldsValue({detection_date: moment(response.data.list[0]['fields']['detection_date'], 'YYYY-MM-DD')})
                }
                setSelectStartPoint(response.data.list[0]['fields']['start_number'])
                setSelectEndPoint(response.data.list[0]['fields']['end_number'])
            } else {
                message.error('获取管线失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error(error);
        });
    }

    const addPoint = (line_id) => {
        for (let i = 0; i < tempPoint.length; i++){
            let data = {"isEdit": false, "line_id": line_id, "values": tempPoint[i]};
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
                            // pathname: '/ProjectManage/PointList',
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
        }
    }

    const deletePoint = () => {
        const currentPointId = []
        for (let i = 0; i < currentPoint.length; i++){
            currentPointId.push(currentPoint[i].key)
        }

        request({
            method: 'post',
            url: 'delete_point/',
            data: {
                "point_ids": currentPointId,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                // message.success('删除成功', 3);
                getPoint();
            } else {
                // message.error('删除失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            // message.error('删除失败:', error, 3);
        });
    }

    try {
        if (location.state.initialization) {
            location.state.initialization = false;
            if (location.state.isEdit) {
                getPoint()
                getLine()
            }
        }
    } catch (e) {
        history.push('/ProjectManage/ProjectList')
    }

    /*三个点用于取出对象中的内容*/
    const onFinish = (values) => {
        //解决时间少8个小时的问题
        values.detection_date = values.detection_date != null ? moment(values.detection_date).format("YYYY-MM-DD") : "";
        let data = {"isEdit": false, "project_id": location.state.project_id, "values": values};
        if (location.state.isEdit) {
            data = {"isEdit": true, "values": values, "line_id": location.state.line_id}
        }

        console.log("data", data)
        request({
            method: 'post',
            url: 'add_line/',
            data: data,
        }).then(function (response) {
            if (response.data.code === 0) {
                if (location.state.isEdit) {
                    const line_id = data.line_id
                    deletePoint()
                    addPoint(line_id)
                    message.success('修改成功', 3);
                } else {
                    const line_id = response.data.line_id
                    addPoint(line_id)
                    message.success('添加成功', 3);
                    history.push({
                        // pathname: '/ProjectManage/LineList',
                        pathname: '/ProjectManage/AddVideo',
                        state: {project_id: location.state.project_id, initialization: true}
                    })
                }
            } else {
                message.error('添加失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error(error);
        });
    };


    const autoFill = () => {
        request({
            method: 'post',
            url: 'get_line_auto_fill/',
            data: {
                "line_id": location.state.line_id,
                "project_id": location.state.project_id
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                form.setFieldsValue({
                    burial_way: response.data.list[0]['fields']['burial_way'],
                    burial_year: response.data.list[0]['fields']['burial_year'],
                    ownership: response.data.list[0]['fields']['ownership'],
                    use_state: response.data.list[0]['fields']['use_state'],
                    detection_unit: response.data.list[0]['fields']['detection_unit'],
                    supervisor_unit: response.data.list[0]['fields']['supervisor_unit'],
                    state: response.data.list[0]['fields']['state'],
                    precision_level: response.data.list[0]['fields']['precision_level'],
                    type: response.data.list[0]['fields']['type']
                });
                if (response.data.list[0]['fields']['detection_date'].length > 0) {
                    form.setFieldsValue({detection_date: moment(response.data.list[0]['fields']['detection_date'], 'YYYY-MM-DD')})
                }
                message.success("填入成功", 3);
            } else if (response.data.code === 2) {
                message.info("该工程下未有任何管线信息", 3);
            } else {
                message.error('自动填入失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error(error);
        });
    }

    const editPoint = () => {
        setPointDrawerVisible(true);
        formTempPoint.setFieldsValue({point_name: ''})
        formTempPoint.setFieldsValue({feature: ''})
        formTempPoint.setFieldsValue({attachment: ''})
        formTempPoint.setFieldsValue({height: ''})
        formTempPoint.setFieldsValue({feature_category: ''})
        formTempPoint.setFieldsValue({x_coordinate: ''})
        formTempPoint.setFieldsValue({y_coordinate: ''})
        formTempPoint.setFieldsValue({depth: ''})
        formTempPoint.setFieldsValue({road_where: ''})
        formTempPoint.setFieldsValue({build_year: ''})
        formTempPoint.setFieldsValue({ownership: ''})
        formTempPoint.setFieldsValue({detection_unit: ''})
        formTempPoint.setFieldsValue({supervisor_unit: ''})
        formTempPoint.setFieldsValue({state: ''})
        formTempPoint.setFieldsValue({precision_level: ''})
        formTempPoint.setFieldsValue({remark: ''})
    };

    const changePoint = (point_name) => {
        setPointDrawerVisible(true);
        for (let i = 0; i < tempPoint.length; i++) {
            if (tempPoint[i].point_name == point_name) {
                formTempPoint.setFieldsValue({point_name: tempPoint[i].point_name})
                formTempPoint.setFieldsValue({feature: tempPoint[i].feature})
                formTempPoint.setFieldsValue({attachment: tempPoint[i].attachment})
                formTempPoint.setFieldsValue({height: tempPoint[i].height})
                formTempPoint.setFieldsValue({feature_category: tempPoint[i].feature_category})
                formTempPoint.setFieldsValue({x_coordinate: tempPoint[i].x_coordinate})
                formTempPoint.setFieldsValue({y_coordinate: tempPoint[i].y_coordinate})
                formTempPoint.setFieldsValue({depth: tempPoint[i].depth})
                formTempPoint.setFieldsValue({road_where: tempPoint[i].road_where})
                formTempPoint.setFieldsValue({build_year: tempPoint[i].build_year})
                formTempPoint.setFieldsValue({ownership: tempPoint[i].ownership})
                formTempPoint.setFieldsValue({detection_unit: tempPoint[i].detection_unit})
                formTempPoint.setFieldsValue({supervisor_unit: tempPoint[i].supervisor_unit})
                formTempPoint.setFieldsValue({state: tempPoint[i].state})
                formTempPoint.setFieldsValue({precision_level: tempPoint[i].precision_level})
                formTempPoint.setFieldsValue({remark: tempPoint[i].remark})

            };
        }
    };

    const closePointDrawer = () => {
        setPointDrawerVisible(false);
    };

    const handleAddTempPoint = (values) => {
        // const newOption = [...tempPoint];
        const newOption = [];
        let option = [];
        for (let i = 0; i < tempPoint.length; i++) {
            if (tempPoint[i].point_name != values.point_name) {
                newOption.push({
                        key: tempPoint[i].key,
                        point_name: tempPoint[i].point_name,
                        feature: tempPoint[i].feature,
                        attachment: tempPoint[i].attachment,
                        height: tempPoint[i].height,
                        feature_category: tempPoint[i].feature_category,
                        x_coordinate: tempPoint[i].x_coordinate,
                        y_coordinate: tempPoint[i].y_coordinate,
                        depth: tempPoint[i].depth,
                        road_where: tempPoint[i].road_where,
                        build_year: tempPoint[i].build_year,
                        ownership: tempPoint[i].ownership,
                        detection_unit: tempPoint[i].detection_unit,
                        supervisor_unit: tempPoint[i].supervisor_unit,
                        state: tempPoint[i].state,
                        precision_level: tempPoint[i].precision_level,
                        remark: tempPoint[i].remark,
                })
            };
            let point_name = tempPoint[i].point_name
            option.push(<Option value={point_name}>{point_name}</Option>);
        }
        newOption.push({
                key: values.point_name,
                point_name: values.point_name,
                feature: values.feature,
                attachment: values.attachment,
                height: values.height,
                feature_category: values.feature_category,
                x_coordinate: values.x_coordinate,
                y_coordinate: values.y_coordinate,
                depth: values.depth,
                road_where: values.road_where,
                build_year: values.build_year,
                ownership: values.ownership,
                detection_unit: values.detection_unit,
                supervisor_unit: values.supervisor_unit,
                state: values.state,
                precision_level: values.precision_level,
                remark: values.remark,
        })
        let point_name = values.point_name
        option.push(<Option value={point_name}>{point_name}</Option>);

        setTempPoint(newOption);
        setPointOption(option);
        closePointDrawer();
        console.log('Current tempPoint after add:', tempPoint);
        console.log('Current adding point:', values);
    };

    const handleDeleteTempPoint = (point_name) => {
        const newOption = [];
        let option = [];
        for (let i = 0; i < tempPoint.length; i++) {
            if (tempPoint[i].point_name != point_name) {
                newOption.push({
                        key: tempPoint[i].key,
                        point_name: tempPoint[i].point_name,
                        feature: tempPoint[i].feature,
                        attachment: tempPoint[i].attachment,
                        height: tempPoint[i].height,
                        feature_category: tempPoint[i].feature_category,
                        x_coordinate: tempPoint[i].x_coordinate,
                        y_coordinate: tempPoint[i].y_coordinate,
                        depth: tempPoint[i].depth,
                        road_where: tempPoint[i].road_where,
                        build_year: tempPoint[i].build_year,
                        ownership: tempPoint[i].ownership,
                        detection_unit: tempPoint[i].detection_unit,
                        supervisor_unit: tempPoint[i].supervisor_unit,
                        state: tempPoint[i].state,
                        precision_level: tempPoint[i].precision_level,
                        remark: tempPoint[i].remark,
                })
            };
            let point_name = tempPoint[i].point_name
            option.push(<Option value={point_name}>{point_name}</Option>);
        }
        setTempPoint(newOption);
        setPointOption(option);
        console.log('Current tempPoint after delete:', tempPoint);
    };

    function handStartPointChange(value) {
        setSelectStartPoint(value);
    }

    function handEndPointChange(value) {
        setSelectEndPoint(value);
    }

    const columns = [
        {
            title: '管点编号',
            dataIndex: 'point_name',
            editable: true,
            width: "16%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '要素类别',
            dataIndex: 'feature_category',
            editable: true,
            width: "16%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '井底埋深',
            dataIndex: 'depth',
            editable: true,
            width: "14%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '所在道路',
            dataIndex: 'road_where',
            editable: true,
            width: "24%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '埋设年代',
            editable: true,
            width: "10%",
            dataIndex: 'build_year',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '状态',
            editable: true,
            width: "17%",
            dataIndex: 'state',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '编辑',
            dataIndex: 'edit',
            width: '10%',
            render: (_, record) => (
                <div style={{display: 'flex'}}>
                    <Button onClick={() => changePoint(record.point_name)} type='link'>
                        编辑
                    </Button>
                </div>
            ),
        },
        {
            title: '删除',
            dataIndex: 'delete',
            width: '10%',
            render: (_, record) => (
                <Popconfirm title="确定删除?" onConfirm={() => handleDeleteTempPoint(record.point_name)}>
                    <Button danger type="link">
                        删除
                    </Button>
                </Popconfirm>
            ),
        }
    ];

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
                    <Breadcrumb.Item>{() => {
                        try {
                            return location.state.isEdit ? "修改管线" : "添加管线";
                        } catch (e) {
                            history.push('/ProjectManage/ProjectList')
                        }
                    }}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Card>
                {/*<Form>*/}
                {/*    <Form.Item label="管点列表" name="point">*/}
                {/*        <div style={{display: 'flex'}}>*/}
                {/*            <Button onClick={editPoint} type='link'>*/}
                {/*                新建管点*/}
                {/*            </Button>*/}
                {/*        </div>*/}
                {/*    </Form.Item>*/}
                {/*    <Table*/}
                {/*        bordered*/}
                {/*        columns={columns}*/}
                {/*        dataSource={tempPoint}*/}
                {/*        pagination={{*/}
                {/*            defaultPageSize: 10,*/}
                {/*            showTotal: total => `共 ${total} 条`,*/}
                {/*            showSizeChanger: true,*/}
                {/*        }}*/}
                {/*    />*/}
                {/*</Form>*/}
                <Space align="center" style={{ marginBottom: 16, fontSizesize:20 }}>
                    管点列表: <Button onClick={editPoint} type='link'>新建管点</Button>
                </Space>
                <Table
                    style={{ marginBottom: 50 }}
                    bordered
                    columns={columns}
                    dataSource={tempPoint}
                    pagination={{
                        defaultPageSize: 10,
                        showTotal: total => `共 ${total} 条`,
                        showSizeChanger: true,
                    }}
                />

                <Form
                    {...formItemLayout}
                    form={form}
                    scrollToFirstError
                    onFinish={onFinish}
                    // onFinishFailed={editPoint}
                    size='default'
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="起始点编号" name="start_number" rules={[{required: true, message: '不能为空'}]}>
                                <Select
                                    showArrow={true}
                                    style={{width: '100%'}}
                                    value={selectStartPoint}
                                    onChange={handStartPointChange}
                                    // tagRender={tagRender}
                                    notFoundContent="无管点"
                                >
                                    {pointOption}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="终止点编号" name="end_number" rules={[{required: true, message: '不能为空'}]}>
                                <Select
                                    showArrow={true}
                                    style={{width: '100%'}}
                                    value={selectEndPoint}
                                    onChange={handEndPointChange}
                                    // tagRender={tagRender}
                                    notFoundContent="无管点"
                                >
                                    {pointOption}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="修复指数" name="rehabilitation_index">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="养护指数" name="maintainance_index">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="地区重要性" name="regional_importance_id"
                                       rules={[{required: true, message: '不能为空'}]}>
                                <Select>
                                    <Option value={1}>中心商业、附近具有甲类民用建筑工程的区域</Option>
                                    <Option value={2}>交通干道、附近具有乙类民用建筑工程的区域</Option>
                                    <Option value={3}>其他行车道路、附近具有丙类民用建筑工程的区域</Option>
                                    <Option value={4}>所有其他区域或F小于4时</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="土质级别" name="soil_id"
                                       rules={[{required: true, message: '不能为空'}]}>
                                <Select>
                                    <Option value={1}>一般土层或 F=0</Option>
                                    <Option value={2}>Ⅰ级湿陷性黄土、Ⅱ级湿陷性黄土、弱膨胀土</Option>
                                    <Option value={3}>Ⅲ级湿陷性黄土、中膨胀土、淤泥质土、红黏土</Option>
                                    <Option value={4}>粉砂层、Ⅳ级湿陷性黄土、强膨胀土、淤泥</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="起始点高程" name="start_height">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="终止点高程" name="end_height">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="起始点埋深" name="start_depth">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="终止点埋深" name="end_depth">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="起始X坐标" name="start_x_coordinate">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="起始Y坐标" name="start_y_coordinate">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="终止X坐标" name="end_x_coordinate">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="终止Y坐标" name="end_y_coordinate">
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="总长度" name="total_length" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber min={0}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="检测长度" name="detection_length" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber min={0}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="流向" name="flow_direction" rules={[{required: true, message: '不能为空'}]}>
                                <Select>
                                    <Option value={0}>顺流</Option>
                                    <Option value={1}>逆流</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="管线亚级类" name="sub_level_type" rules={[{required: true, message: '不能为空'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="材质" name="material" rules={[{required: true, message: '不能为空'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="管径" name="diameter" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="所在道路" name="road_where" rules={[{required: true, message: '不能为空'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="埋设方式">
                                <Space>
                                    <Form.Item label="埋设方式" name="burial_way" noStyle>
                                        <Input/>
                                    </Form.Item>
                                    < div style={{display: 'flex'}}>
                                        <Button onClick={autoFill} type='link'>
                                            自动填入
                                        </Button>
                                        <Tooltip title="自动填入上一管线的权属单位、使用状态、埋设方式、埋设年代等信息">
                                            <QuestionCircleOutlined style={{marginTop: 10}}/>
                                        </Tooltip>
                                    </div>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="埋设年代" name="burial_year" rules={[{required: true, message: '不能为空'}]}>
                                <InputNumber min={1900}/>
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
                            <Form.Item label="使用状态" name="use_state">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="探测日期" name="detection_date">
                                <DatePicker placeholder="选择日期"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="探测单位" name="detection_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="监理单位" name="supervisor_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="状态" name="state">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="精度级别" name="precision_level">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="管线类型" name="type">
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
                                    pathname: '/ProjectManage/LineList',
                                    state: {project_id: location.state.project_id, initialization: true}
                                })
                            }}>
                                返回
                            </Button>
                        </Affix>
                    </Form.Item>
                </Form>

                <Drawer
                    width={1000}
                    visible={pointDrawerVisible}
                    onClose={closePointDrawer}
                    closable={false}
                    keyboard={true}
                    drawerStyle={{paddingTop: '12%'}}
                    destroyOnClose={true}
                    bodyStyle={{ paddingBottom: 80 }}
                >
                    <Form {...formItemLayout} form={formTempPoint} onFinish={handleAddTempPoint} hideRequiredMark>
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
                                <Button onClick={closePointDrawer}>
                                    返回
                                </Button>
                            </Affix>
                        </Form.Item>
                    </Form>
                </Drawer>
            </Card>
        </>
    )
};

export default AddLine;
