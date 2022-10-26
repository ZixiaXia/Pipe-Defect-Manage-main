import {useHistory, useLocation} from "react-router-dom"
import request from "../../../request"
import React, {useState} from "react"
import 'antd/dist/antd.css'
import './style.css'

import {
    Table,
    Button,
    Popconfirm,
    message,
    Badge, Breadcrumb
} from 'antd'

message.config({
    top: 150
});


const LineList = () => {
    const history = useHistory();
    const location = useLocation();
    const [data, setData] = useState({currentData: [], allData: []});
    const [state, setState] = useState({selectedRowKeys: []});//使用state从而更改数据后能够实时更新

    const getLine = () => {
        request({
            method: 'post',
            url: 'get_line/',
            data: {
                "condition": "all",
                "project_id": location.state.project_id,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let newData = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    newData.push({
                        key: response.data.list[i]['pk'],
                        start_number: response.data.list[i]['fields']['start_number'],
                        end_number: response.data.list[i]['fields']['end_number'],
                        flow_direction: response.data.list[i]['fields']['flow_direction'],
                        material: response.data.list[i]['fields']['material'],
                        diameter: response.data.list[i]['fields']['diameter'],
                        remark: response.data.list[i]['fields']['remark'],
                        point_count: response.data.list[i]['fields']['point_count'],
                        video_count: response.data.list[i]['fields']['video_count'],
                    });
                }
                setData({currentData: newData, allData: newData});
            } else {
                message.error('获取失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取失败:', error, 3);
        });
    };

    try {
        if (location.state.initialization) {
            getLine();
            location.state.initialization = false;
        }
    } catch (e) {
        history.push('/ProjectManage/ProjectList')
    }


    const handleDelete = (selectedRowKeys) => {
        if (selectedRowKeys.length === 0) {
            message.warn('未选中');
            return;
        }
        request({
            method: 'post',
            url: 'delete_line/',
            data: {
                "line_ids": selectedRowKeys,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                message.success('删除成功', 3);
                getLine();
            } else {
                message.error('删除失败:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('删除失败:', error, 3);
        });
    };

    const onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        setState({selectedRowKeys: selectedRowKeys});
    };

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
            title: '起始点编号',
            dataIndex: 'start_number',
            editable: true,
            width: "14%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '终止点编号',
            dataIndex: 'end_number',
            editable: true,
            width: "14%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '流向',
            dataIndex: 'flow_direction',
            editable: true,
            width: "21%",
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '材质',
            editable: true,
            width: "10%",
            dataIndex: 'material',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: '管径',
            editable: true,
            width: "10%",
            dataIndex: 'diameter',
            ellipsis: {
                showTitle: false,
            },
            align: "center",
        },
        {
            title: "管点",
            dataIndex: "point",
            width: "10%",
            align: "center",
            render: (_, record) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                <Badge count={record.point_count}
                       offset={[13, -7]}
                       size="small"
                       style={{backgroundColor: '#52c41a'}}
                       showZero={false}
                >
                    <a href="javascript:" onClick={() => history.push({
                        pathname: '/ProjectManage/PointList',
                        state: {project_id: location.state.project_id, line_id: record.key, initialization: true}
                    })}>管点</a>
                </Badge>
            )
        },
        {
            title: "视频",
            dataIndex: "video",
            width: "10%",
            align: "center",
            render: (_, record) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                <Badge count={record.video_count}
                       offset={[13, -7]}
                       size="small"
                       style={{backgroundColor: '#52c41a'}}
                       showZero={false}
                >
                    <a href="javascript:" onClick={() => history.push({
                        pathname: '/ProjectManage/VideoList',
                        state: {project_id: location.state.project_id, line_id: record.key, initialization: true}
                    })}>视频</a>
                </Badge>
            )
        },
        {
            title: "编辑",
            dataIndex: "Edit",
            width: "10%",
            align: "center",
            render: (_, record) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                <a href="javascript:" onClick={() => history.push({
                    pathname: '/ProjectManage/AddLine',
                    state: {
                        isEdit: true,
                        line_id: record.key,
                        project_id: location.state.project_id,
                        initialization: true
                    }
                })}>编辑</a>
            )
        }
    ];
    return (
        <>
            <div>
                <Button
                    onClick={() => {
                        history.push('/ProjectManage/ProjectList')
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
                            pathname: '/ProjectManage/AddLine',
                            state: {isEdit: false, project_id: location.state.project_id, initialization: true}
                        })
                    }}
                    type="primary"
                    style={{
                        marginBottom: 16,
                        float: 'right',
                        marginRight: "1%"
                    }}
                >
                    添加管线
                </Button>
            </div>
            <div style={{marginBottom: 10}}>
                <Breadcrumb style={{border:1}}>
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
                    <Breadcrumb.Item>管线列表</Breadcrumb.Item>
                </Breadcrumb>
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
                                <p>{record.remark}</p>
                            </>
                        )
                    },
                    rowExpandable: record => record.remark.length > 0,
                }}
                pagination={{
                    defaultPageSize: 10,
                    showTotal: total => `共 ${total} 条`,
                    showSizeChanger: true,
                }}
                locale={{
                    emptyText: '没有数据',
                }}
            />
        </>
    );
};

export default LineList;
