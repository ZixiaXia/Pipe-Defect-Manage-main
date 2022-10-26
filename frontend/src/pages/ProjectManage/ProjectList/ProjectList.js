import {useHistory} from "react-router-dom"
import request from "../../../request"
import React, {useState} from "react"
import 'antd/dist/antd.css'
import './style.css'
import {
    Table,
    Button,
    Popconfirm,
    message,
    Input,
    Tooltip,
    DatePicker,
    Select,
    Tag,
    Row,
    Col,
    Badge,
    Spin,
    Breadcrumb,
    Card
} from 'antd';

const {Search} = Input;
const {RangePicker} = DatePicker;
const {Option} = Select;
message.config({
    top: 150
});


const ProjectList = () => {
    const history = useHistory();
    const [searchSelect, setSearchSelect] = useState('project_name');
    const [initialization, setInitialization] = useState(true);
    const [data, setData] = useState({currentData: [], allData: []});
    const [state, setState] = useState({selectedRowKeys: []});//使用state从而更改数据后能够实时更新
    const [downloadFileSpin, setDownloadFileSpin] = useState({});//键为表格每行的key，值为是否spinning
    const [projectListTableIsLoading, setProjectListTableIsLoading] = useState(true);

    const getProject = () => {
        request({
            method: 'post',
            url: 'get_project/',
            data: {
                "condition": "all",
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let newData = [];
                let count = 0;
                for (let i = 0; i < response.data.list.length; i++) {
                    newData.push({
                        key: response.data.list[i]['pk'],
                        project_no: response.data.list[i]['fields']['project_no'],
                        project_name: response.data.list[i]['fields']['project_name'],
                        staff: response.data.list[i]['fields']['staff'],
                        start_date: response.data.list[i]['fields']['start_date'],
                        report_no: response.data.list[i]['fields']['report_no'],
                        description: response.data.list[i]['fields']['description'],
                        line_count: response.data.list[i]['fields']['line_count'],
                        video_count: response.data.list[i]['fields']['video_count'],
                    });
                    const res = getStaff(newData[i].staff);
                    res.then(data => {
                        newData[i].staff = (<Row>{data}</Row>);
                        // console.log(data)
                        downloadFileSpin[newData[i].key] = false;
                        count += 1;
                        if (count === response.data.list.length) {//staff全部获取完后才更新
                            setData({currentData: newData, allData: newData});
                            setDownloadFileSpin(downloadFileSpin);
                        }
                    });
                    setProjectListTableIsLoading(false);
                }
            } else {
                message.error('获取失败1:' + response.data.msg + '刷新重试', 3);
            }
        }).catch(function (error) {
            // message.error('获取失败2:' + error + '刷新重试', 3);
            getProject();
        });
    };
    if (initialization) {
        getProject();
        setInitialization(false);
    }

    function getStaff(str) {
        let staff_ids = [];
        try {
            const strList = str.split(",");
            staff_ids = strList.map(Number);
        } catch (error) {
            message.error('获取staff失败7:' + error);
        }
        const res = request({//这里获得的并不是返回的数组而是Promise
            method: 'post',
            url: 'get_staff/',
            data: {
                "condition": "staff_id",
                "staff_id": staff_ids
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let cols = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    let staff_name = response.data.list[i]["fields"]["staff_name"];
                    cols.push(<Col><Tag style={{marginRight: 3, fontSize: 15}}
                                        color="blue">{staff_name}</Tag></Col>);
                }

                return cols;
            } else {
                message.error('获取staff失败5:' + response.data.msg, 3);
                return [];
            }
        }).catch(function (error) {
            message.error('获取staff失败6:' + error, 3);
            return [];
        });
        // let ans = [];
        // let p = 111;
        // const t =  res.then(data => {//获取Promise的数据
        //     console.log(p)
        //     return data;
        // })
        return res;
    }

    const handleDelete = (selectedRowKeys) => {
        if (selectedRowKeys.length === 0) {
            message.warn('未选中');
            return;
        }
        request({
            method: 'post',
            url: 'delete_project/',
            data: {
                "project_ids": selectedRowKeys,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                message.success('删除成功');
                getProject();
            } else {
                message.error('删除失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('删除失败2:' + error, 3);
        });
    };

    const onSearch = value => {
        if (value.length === 0) {
            setData({currentData: data.allData, allData: data.allData});
            return;
        }
        let newData = [];
        for (let i = 0; i < data.allData.length; i++) {
            if (data.allData[i][searchSelect].includes(value)) newData.push(data.allData[i]);
        }
        setData({currentData: newData, allData: data.allData});
    };

    const onRangePickerChange = value => {
        if (value === null) {
            setData({currentData: data.allData, allData: data.allData});
            return;
        }
        let startDate = value[0].format("YYYY-MM-DD");
        let endDate = value[1].format("YYYY-MM-DD");
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        let newData = [];
        for (let i = 0; i < data.allData.length; i++) {
            let currentDate = new Date(data.allData[i]['start_date']);
            if (currentDate >= startDate && currentDate <= endDate) newData.push(data.allData[i]);
        }
        setData({currentData: newData, allData: data.allData});
    };

    const onSearchSelect = value => {
        setSearchSelect(value);
    };

    const onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        setState({selectedRowKeys: selectedRowKeys});
    };

    function handleDownload(url, fileName, key) {
        //必须要先解构再set state，否则table里的值不会变
        let newDownloadFileSpin = {...downloadFileSpin};
        newDownloadFileSpin[key] = true;
        // console.log(newDownloadFileSpin);
        setDownloadFileSpin(newDownloadFileSpin);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/msword',
            },
        }).then((response) => response.blob())
            .then((blob) => {
                //创建blob文件
                const url = window.URL.createObjectURL(
                    new Blob([blob]),
                );
                //生成a标签并设置属性
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    fileName + '.docx',
                );
                //插入a标签
                document.body.appendChild(link);
                //模拟点击开始下载
                link.click();
                //清除a标签
                link.parentNode.removeChild(link);

                newDownloadFileSpin = {...downloadFileSpin}
                newDownloadFileSpin[key] = false;
                setDownloadFileSpin(newDownloadFileSpin);
                // console.log(newDownloadFileSpin);
            })
            .catch(function (error) {
                message.error('下载失败1:' + error, 3);

                newDownloadFileSpin = {...downloadFileSpin}
                newDownloadFileSpin[key] = false;
                setDownloadFileSpin(newDownloadFileSpin);
            });
        // console.log('fff')
    }

    const {selectedRowKeys} = state;
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            {
                key: 'all',
                text: '全选',
                onSelect: allRowKeys => {
                    let newSelectedRowKeys;
                    newSelectedRowKeys = allRowKeys.filter((key, index) => {
                        return true;
                    });
                    setState({selectedRowKeys: newSelectedRowKeys});
                },
            },
            {
                key: 'invert',
                text: '反选',
                onSelect: allRowKeys => {
                    let newSelectedRowKeys;
                    newSelectedRowKeys = allRowKeys.filter((key, index) => {
                        return !(state.selectedRowKeys.includes(key));//用includes判断是否含有某元素
                    });
                    setState({selectedRowKeys: newSelectedRowKeys});
                },
            },
            {
                key: 'clear',
                text: '清空',
                onSelect: allRowKeys => {
                    let newSelectedRowKeys = [];
                    setState({selectedRowKeys: newSelectedRowKeys});
                },
            },
        ],
    };

    const columns = [
        {
            title: '工程编号',
            dataIndex: 'project_no',
            editable: true,
            width: "12%",
            ellipsis: {
                showTitle: false,
            },
            render: project_no => (//显示提示
                <Tooltip placement="topLeft" title={project_no}>
                    {project_no}
                </Tooltip>
            ),
            align: "center",
        },
        {
            title: '工程名称',
            dataIndex: 'project_name',
            editable: true,
            width: "19%",
            ellipsis: {
                showTitle: false,
            },
            render: (project_name, record) => (
                <Tooltip placement="topLeft" title={project_name}>
                    {/* eslint-disable-next-line no-script-url,jsx-a11y/anchor-is-valid */}
                    <a href="javascript:" onClick={() => {
                        history.push({
                            pathname: '/ProjectManage/AddProject',
                            state: {isEdit: true, project_id: record.key, initialization: true}
                        })
                    }}>{project_name}</a>
                </Tooltip>
            ),
            align: "center",
        },
        {
            title: '负责人',
            editable: true,
            width: "10%",
            dataIndex: 'staff',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
            // render: (text, record, index) => {
            //     return (
            //         <Row>
            //             {getStaff(record.staff)}
            //         </Row>
            //     )
            // },
        },
        {
            title: '开工日期',
            editable: true,
            width: "15%",
            dataIndex: 'start_date',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
            render: start_date => (
                <Tooltip placement="topLeft" title={start_date}>
                    {start_date}
                </Tooltip>
            ),
            sorter: {
                compare: (a, b) => {
                    let date1 = new Date(a.start_date);
                    let date2 = new Date(b.start_date);
                    return date1.getTime() - date2.getTime();
                },
                multiple: 1,
            },
        },
        {
            title: '报告编号',
            editable: true,
            width: "14%",
            dataIndex: 'report_no',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
            render: report_no => (
                <Tooltip placement="topLeft" title={report_no}>
                    {report_no}
                </Tooltip>
            ),
        },
        {
            title: "管线",
            dataIndex: "Line",
            width: "10%",
            align: "center",
            render: (_, record) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                <Badge count={record.line_count}
                       offset={[13, -7]}
                       size="small"
                       style={{backgroundColor: '#52c41a'}}
                       showZero={false}
                >
                    <a href="javascript:" onClick={() => history.push({
                        pathname: '/ProjectManage/LineList',
                        state: {project_id: record.key, initialization: true}
                    })}>管线</a>
                </Badge>
            )
        },
        {
            title: '视频',
            dataIndex: 'video',
            align: "center",
            width: "10%",
            render:
                (_, record) =>
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                    <Badge count={record.video_count}
                           offset={[13, -7]}
                           size="small"
                           style={{backgroundColor: '#52c41a'}}
                           showZero={false}
                    >
                        <a href="javascript:" onClick={() => history.push({
                            pathname: '/ProjectManage/VideoList',
                            state: {project_id: record.key, initialization: true}
                        })}>视频</a>
                    </Badge>
        },
        {
            title: '报告',
            dataIndex: 'report',
            align: "center",
            width: "10%",
            render:
                (_, record) =>
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url,react/jsx-no-target-blank
                    //使用download，这样返回的东西都以文件下载
                    <Spin spinning={downloadFileSpin[record.key]}>
                        {/*<a href={`${request.defaults.baseURL}get_report/${record.key}`}*/}
                        {/*   download={record.project_name}>报告</a>*/}
                        <Button type="link"
                                onClick={() => handleDownload(
                                    `${request.defaults.baseURL}get_report/${record.key}`,
                                    record.project_name,
                                    record.key)}>报告</Button>
                    </Spin>
        },
    ];


    return (
        <>
            <div>
                <Button
                    onClick={() => {
                        history.push({
                            pathname: '/',
                        })
                    }}
                    style={{float: 'right', marginRight: "1%"}}
                >
                    返回
                </Button>
                <Popconfirm title="确定删除?" onConfirm={() => handleDelete(state.selectedRowKeys)}>
                    <Button
                        danger
                        type="primary"
                        style={{
                            float: 'right', marginRight: "1%"
                        }}
                    >
                        删除所选
                    </Button>
                </Popconfirm>
                <Button
                    onClick={() => {
                        history.push({
                            pathname: '/ProjectManage/AddProject',
                            state: {isEdit: false, initialization: true}
                        })
                    }}
                    type="primary"
                    style={{
                        marginBottom: 16,
                        float: 'right',
                        marginRight: "1%"
                    }}
                >
                    添加工程
                </Button>
            </div>
            <div style={{marginBottom: 10}}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a href="javascript:" onClick={() => {
                            history.push('/')
                        }}>主页</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>工程列表</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div>
                <Search
                    placeholder="搜索..."
                    onSearch={onSearch}
                    enterButton
                    style={{
                        float: 'left',
                        width: "25%",
                        // marginLeft: "1%",
                        marginBottom: 10
                    }}
                />
                <Select defaultValue="以工程名称" style={{float: 'left', width: 120}} onChange={onSearchSelect}>
                    <Option value="project_name">以工程名称</Option>
                    <Option value="project_no">以工程编号</Option>
                    <Option value="staff">以负责人</Option>
                </Select>
                <RangePicker
                    onChange={onRangePickerChange}
                    style={{
                        float: 'left',
                        marginLeft: "1%"
                    }}
                />
            </div>
            <Table
                // bordered
                rowKey={record => record.key}//record.project_id为每一行设置不同的key，否则点击一行就会全选,或者插入数据时设置key
                rowSelection={rowSelection}
                dataSource={data.currentData}
                columns={columns}
                expandable={{
                    expandedRowRender: record => {
                        return (
                            <>
                                <p>{record.description}</p>
                            </>
                        )
                    },
                    rowExpandable: record => record.description.length > 0,
                }}
                pagination={{
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                }}
                locale={{
                    emptyText: '没有数据',
                    cancelSort: '取消排序',
                    triggerAsc: '点击升序',
                    triggerDesc: '点击降序'
                }}
                loading={projectListTableIsLoading}
            />
        </>
    );
};

export default ProjectList
