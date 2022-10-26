import React, {useState} from "react";
import 'antd/dist/antd.css';
import request from '../../../request'
import {useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import StaffEditableTable from './staffList'
import {
    Form,
    Input,
    Button,
    message,
    DatePicker,
    Card,
    Affix,
    Row,
    Col,
    Drawer,
    Select,
    Tag,
    Breadcrumb
} from 'antd'

const {TextArea} = Input;
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


const AddProject = () => {
    const history = useHistory();
    const location = useLocation();//获取前一页面history传递的参数
    const [form] = Form.useForm();//对表单数据域进行交互
    const [staffDrawerVisible, setStaffDrawerVisible] = useState(false);
    const [staffOption, setStaffOption] = useState([]);
    const [selectStaffs, setSelectStaffs] = useState([]);

    try {
        if (location.state.initialization) {
            location.state.initialization = false;
            if (location.state.isEdit) {
                getProject();
            } else {
                getStaff([]);
            }
        }
    } catch (e) {
        history.push('/ProjectManage/ProjectList')
    }

    function getProject() {
        request({
            method: 'post',
            url: 'get_project/',
            data: {
                "condition": "project_id",
                "project_id": location.state.project_id
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                form.setFieldsValue({
                    project_no: response.data.list[0]['fields']['project_no'],
                    project_name: response.data.list[0]['fields']['project_name'],
                    report_no: response.data.list[0]['fields']['report_no'],
                    requester_unit: response.data.list[0]['fields']['requester_unit'],
                    construction_unit: response.data.list[0]['fields']['construction_unit'],
                    design_unit: response.data.list[0]['fields']['design_unit'],
                    build_unit: response.data.list[0]['fields']['build_unit'],
                    supervisory_unit: response.data.list[0]['fields']['supervisory_unit'],
                    move: response.data.list[0]['fields']['move'],
                    plugging: response.data.list[0]['fields']['plugging'],
                    drainage: response.data.list[0]['fields']['drainage'],
                    dredging: response.data.list[0]['fields']['dredging'],
                    detection_equipment: response.data.list[0]['fields']['detection_equipment'],
                    detection_method: response.data.list[0]['fields']['detection_method'],
                    description: response.data.list[0]['fields']['description']
                });
                //字符串数组转数字数组
                if (response.data.list[0]['fields']['staff'].length > 0) {
                    const strList = response.data.list[0]['fields']['staff'].split(",");
                    const numList = strList.map(Number);
                    getStaff(numList);
                } else {
                    getStaff([]);
                }
                if (response.data.list[0]['fields']['start_date'].length > 0) {
                    form.setFieldsValue({start_date: moment(response.data.list[0]['fields']['start_date'], 'YYYY-MM-DD')})
                }
            } else {
                message.error('获取工程失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取工程失败2:' + error);
        });
    }

    /*三个点用于取出对象中的内容*/
    const onFinish = (values) => {
        //解决时间少8个小时的问题
        values.start_date = values.start_date != null ? moment(values.start_date).format("YYYY-MM-DD") : "";
        let data = {"isEdit": false, "values": values};
        data['values'].staff = selectStaffs;
        // console.log(data);
        if (location.state.isEdit) {
            data = {"isEdit": true, "values": values, "project_id": location.state.project_id}
        }
        request({
            method: 'post',
            url: 'add_project/',
            data: data,
        }).then(function (response) {
            if (response.data.code === 0) {
                if (location.state.isEdit) {
                    message.success('修改成功', 3);
                } else {
                    message.success('添加成功', 3);
                    history.push('/ProjectManage/ProjectList')
                }
            } else {
                message.error('添加失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error(error);
        });
    };

    const editStaff = () => {
        setStaffDrawerVisible(true);
    };

    function handleTagClose(staff_id) {
        const newSelectStaffs = [];
        for (let i = 0; i < selectStaffs.length; i++) {
            if (selectStaffs[i] !== staff_id) newSelectStaffs.push(selectStaffs[i]);
        }
        setSelectStaffs(newSelectStaffs);
    }

    function tagRender(props) {
        // console.log(props)
        const {value, label, closable, onClose} = props;
        const onPreventMouseDown = event => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                color='green'
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={() => handleTagClose(value)}
                style={{marginRight: 3, fontSize: 15}}
            >
                {label}
            </Tag>
        );
    }

    //设置下拉列表中的项,numList为本项目的staff列表
    function getStaff(numList) {
        request({
            method: 'post',
            url: 'get_staff/',
            data: {
                "condition": "all",
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let option = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    let staff_name = response.data.list[i]["fields"]["staff_name"];
                    let staff_id = response.data.list[i]["pk"];
                    option.push(<Option value={staff_id}>{staff_name}</Option>);
                }
                setStaffOption(option);
                setSelectStaffs(numList);
            } else {
                message.error('获取staff失败3:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取staff失败4:' + error);
        });
    }

    const closeStaffDrawer = () => {
        setStaffDrawerVisible(false);
        //关闭drawer时重新获取负责人下拉列表
        getStaff(selectStaffs);
    };

    function handStaffChange(value) {
        setSelectStaffs(value);
    }

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
                    <Breadcrumb.Item>{location.state.isEdit ? "修改工程" : "添加工程"}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Card>
                <Form
                    {...formItemLayout}
                    form={form}db
                    scrollToFirstError
                    onFinish={onFinish}
                    size='default'
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="工程编号" name="project_no">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="工程名称" name="project_name" rules={[{required: true, message: '不能为空'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="负责人" name="staff">
                                <div style={{display: 'flex'}}>
                                    <Select
                                        mode="multiple"
                                        showArrow={true}
                                        style={{width: '100%'}}
                                        value={selectStaffs}
                                        onChange={handStaffChange}
                                        tagRender={tagRender}
                                        notFoundContent="无负责人"
                                    >
                                        {staffOption}
                                    </Select>
                                    <Button onClick={editStaff} type='link'>
                                        编辑
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="开工日期" name="start_date">
                                <DatePicker placeholder="选择日期"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="报告编号" name="report_no">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="委托单位" name="requester_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="建设单位" name="construction_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="设计单位" name="design_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="施工单位" name="build_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="监理单位" name="supervisory_unit">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="移动方式" name="move">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="封堵方式" name="plugging">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="排水方式" name="drainage">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="清疏方式" name="dredging">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="检测设备" name="detection_equipment">
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="检测方式" name="detection_method">
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="描述" name="description">
                                <TextArea autoSize={{minRows: 1}}/>
                            </Form.Item>
                        </Col>
                    </Row>


                    <Form.Item {...tailFormItemLayout}>
                        <Affix offsetBottom={10}>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button onClick={() => {
                                history.push('/ProjectManage/ProjectList')
                            }}>
                                返回
                            </Button>
                        </Affix>
                    </Form.Item>
                </Form>
                <Drawer
                    width={720}
                    visible={staffDrawerVisible}
                    onClose={closeStaffDrawer}
                    closable={false}
                    keyboard={true}
                    drawerStyle={{paddingTop: '12%'}}
                    destroyOnClose={true}
                >
                    <StaffEditableTable/>
                </Drawer>
            </Card>
        </>
    )
};

export default AddProject;
