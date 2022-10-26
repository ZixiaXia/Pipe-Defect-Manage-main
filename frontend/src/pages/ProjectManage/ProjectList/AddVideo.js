import {useHistory, useLocation} from "react-router-dom";
import request from "../../../request";
import React, {useState, useRef} from "react";
import "antd/dist/antd.css";
import moment from "moment";
import {
    Form,
    Input,
    Button,
    message,
    DatePicker,
    Card,
    Select,
    Affix,
    Row,
    Col,
    Upload,
    Modal,
    Breadcrumb,
} from "antd";

const {Option} = Select;

message.config({
    top: 200,
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

const AddVideo = () => {
    const history = useHistory();
    const location = useLocation(); //获取前一页面history传递的参数
    const [form] = Form.useForm(); //对表单数据域进行交互
    const [dirForm] = Form.useForm();
    // const [isModalVisible, setIsModalVisible] = useState(false);
    // const [videoName, setVideoName] = useState("");
    const [lineOption, setLineOption] = useState(undefined);
    const fileList = useRef([]);
    const [isAddNewVideo, setIsAddNewVideo] = useState(true);

    //如果是从管线列表页跳转过来的，那么就会用到以下的东西
    const [lineBreadcrumb, setLineBreadcrumb] = useState(undefined);

    try {
        if (location.state.initialization) {
            location.state.initialization = false;
            setIsAddNewVideo(location.state.isAddNewVideo);
            request({
                method: "post",
                url: "get_line/",
                data: {
                    condition: "all",
                    project_id: location.state.project_id,
                },
            })
                .then(function (response) {
                    if (response.data.code === 0) {
                        let option = [];
                        for (let i = 0; i < response.data.list.length; i++) {
                            let lineNumber = response.data.list[i]["fields"]["start_number"] + "~" + response.data.list[i]["fields"]["end_number"];
                            let lineId = response.data.list[i]["pk"];
                            option.push(<Option value={lineId}>{lineNumber}</Option>);
                        }
                        setLineOption(option);
                    } else {
                        message.error("获取管线失败1:" + response.data.msg, 3);
                    }
                })
                .catch(function (error) {
                    message.error("获取管线失败2:" + error, 3);
                });
            if (location.state.line_id !== undefined) {
                setLineBreadcrumb(
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push({
                                pathname: '/ProjectManage/LineList',
                                state: {project_id: location.state.project_id, initialization: true}
                            })
                        }}>管线列表</a>
                    </Breadcrumb.Item>
                );
            }
            if (location.state.isEdit) {
                request({
                    method: "post",
                    url: "get_video/",
                    data: {
                        condition: "video_id",
                        video_id: location.state.video_id,
                    },
                })
                    .then(function (response) {
                        if (response.data.code === 0) {
                            form.setFieldsValue({
                                remark: response.data.list[0]["fields"]["remark"],
                                name: response.data.list[0]["fields"]["name"],
                                path: response.data.list[0]["fields"]["path"],
                                line_id: response.data.list[0]["fields"]["line_id"],
                                import_date: response.data.list[0]["fields"]["import_date"],
                            });
                            if (response.data.list[0]["fields"]["record_date"].length > 0) {
                                // console.log("record_date from database: ", response.data.list[0]["fields"]["record_date"])
                                form.setFieldsValue({
                                    record_date: moment(
                                        response.data.list[0]["fields"]["record_date"],
                                        "YYYY-MM-DD"
                                    ),
                                });
                            }
                        } else {
                            message.error("获取视频失败:" + response.data.msg, 3);
                        }
                    })
                    .catch(function (error) {
                        message.error(error);
                    });
            }
        }
    } catch (e) {
        history.push("/ProjectManage/ProjectList");
    }

    /*三个点用于取出对象中的内容*/
    const onFinish = (values) => {
        console.log(fileList)
        console.log("filelist:", fileList.current[0].lastModifiedDate.getMonth()+1)
        console.log("record_date", values.record_date)
        //解决时间少8个小时的问题
        values.record_date =
            values.record_date != null
                ? moment(values.record_date).format("YYYY-MM-DD")
                : "";
        values.import_date =
            values.import_date != null
                ? moment(values.import_date).format("YYYY-MM-DD HH:mm:ss")
                : "";
        let data = {
            isEdit: false,
            project_id: location.state.project_id,
            values: values,
        };
        if (location.state.isEdit) {
            data = {
                isEdit: true,
                values: values,
                video_id: location.state.video_id,
            };
        }
        request({
            method: "post",
            url: "add_video/",
            data: data,
        })
            .then(function (response) {
                if (response.data.code === 0) {
                    if (location.state.isEdit) {
                        message.success("修改成功", 3);
                    } else {
                        message.success("添加成功", 3);
                        history.push({
                            pathname: "/ProjectManage/VideoList",
                            state: {
                                project_id: location.state.project_id,
                                line_id:location.state.line_id,
                                initialization: true,
                            },
                        });
                    }
                } else {
                    message.error("添加失败:" + response.data.msg, 3);
                }
            })
            .catch(function (error) {
                message.error(error);
            });
    };

    const props = {
        onRemove: (file) => {
            let index = -1;
            for (let i = 0; i < fileList.current.length; i++) {
                if (file.uid === fileList.current[i].uid) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                message.error("error: index=-1");
                return;
            }
            fileList.current.splice(index, 1);
            let video_names = "";
            let full_paths = "";
            let record_date = "";
            for (let i = 0; i < fileList.current.length; i++) {
                video_names += fileList.current[i].name + "?";
                full_paths += fileList.current[i].path + "?";//文件以?分割
                record_date = fileList.current[i].lastModifiedDate;
            }
            if (fileList.current.length > 0) {
                video_names = video_names.slice(0, -1);
                full_paths = full_paths.slice(0, -1);
            }
            const month = record_date.getMonth()+1
            record_date = record_date.getFullYear() + "-" + month + "-" + record_date.getDate()
            form.setFieldsValue({
                name: video_names,
                path: full_paths,
                import_date: moment().format("YYYY-MM-DD HH:mm:ss"),
                record_date: moment(record_date,"YYYY-MM-DD"),
            });
        },
        beforeUpload: (file) => {
            if (!isAddNewVideo) fileList.current = [file];
            else fileList.current = [...fileList.current, file];
            // setIsModalVisible(true);
            let video_names = "";
            let full_paths = "";
            let record_date = "";
            for (let i = 0; i < fileList.current.length; i++) {
                video_names += fileList.current[i].name + "?";
                full_paths += fileList.current[i].path + "?";//文件以?分割
                record_date = fileList.current[i].lastModifiedDate;
            }
            if (fileList.current.length > 0) {
                video_names = video_names.slice(0, -1);
                full_paths = full_paths.slice(0, -1);
            }
            const month = record_date.getMonth()+1
            record_date = record_date.getFullYear() + "-" + month + "-" + record_date.getDate()
            form.setFieldsValue({
                name: video_names,
                path: full_paths,
                import_date: moment().format("YYYY-MM-DD HH:mm:ss"),
                record_date: moment(record_date,"YYYY-MM-DD"),
            });
            return false;//返回false，即不进行上传
        },
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
                    {lineBreadcrumb}
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push({
                                pathname: "/ProjectManage/VideoList",
                                state: {
                                    project_id: location.state.project_id,
                                    line_id: location.state.line_id,
                                    initialization: true,
                                },
                            })
                        }}>视频列表</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{location.state.isEdit ? "修改视频" : "添加视频"}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Card>
                <Form
                    {...formItemLayout}
                    form={form}
                    scrollToFirstError
                    onFinish={onFinish}
                    size="default"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="选择文件">
                                <Upload
                                    // onChange={handleUploadChange}
                                    // beforeUpload={handleBeforeUpload}
                                    // onRemove={handleOnRemove}
                                    {...props}
                                    multiple={isAddNewVideo}
                                    showUploadList={isAddNewVideo}
                                    accept="video/*"
                                    // fileList={fileList}
                                >
                                    <Button>选择文件</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="视频文件名"
                                name="name"
                                rules={[{required: true, message: "不能为空"}]}
                            >
                                <Input disabled={true}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="视频路径"
                                name="path"
                                rules={[{required: true, message: "不能为空"}]}
                            >
                                {/*<Input disabled={true}/>*/}
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="导入日期" name="import_date">
                                <Input disabled={true}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="所属管线"
                                name="line_id"
                                rules={[{required: true, message: "不能为空"}]}
                                locale={{emptyText: "未添加管线"}}
                                // dropdownRender={menu => (
                                // <>
                                //   {menu}
                                //   <Divider style={{ margin: '8px 0' }} />
                                //   <Space align="center" style={{ padding: '0 8px 4px' }}>
                                //     <Input placeholder="Please enter item" value={name} onChange={onNameChange} />
                                //     <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                                //       <PlusOutlined /> Add item
                                //     </Typography.Link>
                                //   </Space>
                                // </>
                                // )}
                            >
                                <Select notFoundContent="未添加管线">{lineOption}</Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="检测日期/录制日期" name="record_date">
                                <DatePicker/>
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
                            <Button
                                onClick={() => {
                                    history.push({
                                        pathname: "/ProjectManage/VideoList",
                                        state: {
                                            project_id: location.state.project_id,
                                            line_id:location.state.line_id,
                                            initialization: true,
                                        },
                                    });
                                }}
                            >
                                返回
                            </Button>
                        </Affix>
                    </Form.Item>
                </Form>
            </Card>
        </>
    );
};

export default AddVideo;
