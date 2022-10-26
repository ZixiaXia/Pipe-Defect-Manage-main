import {useHistory, useLocation} from "react-router-dom"
import {Table, Button, Popconfirm, message, Breadcrumb} from 'antd'
import request from "../../../request"
import React, {useState} from "react"
import 'antd/dist/antd.css'
import './style.css'

message.config({
    top: 150
});


const PointList = () => {
    const history = useHistory();
    const location = useLocation();
    const [data, setData] = useState({currentData: [], allData: []});
    const [state, setState] = useState({selectedRowKeys: []});//使用state从而更改数据后能够实时更新

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
                for (let i = 0; i < response.data.list.length; i++) {
                    newData.push({
                        key: response.data.list[i]['pk'],
                        point_name: response.data.list[i]['fields']['point_name'],
                        feature_category: response.data.list[i]['fields']['feature_category'],
                        depth: response.data.list[i]['fields']['depth'],
                        road_where: response.data.list[i]['fields']['road_where'],
                        build_year: response.data.list[i]['fields']['build_year'],
                        state: response.data.list[i]['fields']['state'],
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
            getPoint();
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
            url: 'delete_point/',
            data: {
                "point_ids": selectedRowKeys,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                message.success('删除成功', 3);
                getPoint();
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
            title: "编辑",
            dataIndex: "Edit",
            width: "10%",
            align: "center",
            render: (_, record) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid,no-script-url
                <a href="javascript:" onClick={() => history.push({
                    pathname: '/ProjectManage/AddPoint',
                    state: {
                        isEdit: true,
                        point_id: record.key,
                        project_id: location.state.project_id,
                        line_id: location.state.line_id,
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
                        history.push({
                            pathname: '/ProjectManage/LineList',
                            state: {project_id: location.state.project_id, initialization: true}
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
                            pathname: '/ProjectManage/AddPoint',
                            state: {
                                isEdit: false,
                                project_id: location.state.project_id,
                                line_id: location.state.line_id,
                                initialization: true
                            }
                        })
                    }}
                    type="primary"
                    style={{
                        marginBottom: 16,
                        float: 'right',
                        marginRight: "1%"
                    }}
                >
                    添加管点
                </Button>

            </div>
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
                    <Breadcrumb.Item>管点列表</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <Table
                // bordered
                rowKey={record => record.key}//record.project_id为每一行设置不同的key，否则点击一行就会全选,或者插入数据时设置key
                rowSelection={rowSelection}
                dataSource={data.currentData}
                columns={columns}
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

export default PointList;
