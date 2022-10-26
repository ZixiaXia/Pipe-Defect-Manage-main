import React, {useState} from 'react';
import request from "../../../request";
import 'antd/dist/antd.css';
import {
    Table,
    Input,
    InputNumber,
    Popconfirm,
    Form,
    Typography,
    Select,
    Button, Tooltip, message
} from 'antd';

const {Option} = Select;

const EditableCell = ({
                          editing,
                          dataIndex,
                          title,
                          inputType,
                          record,
                          index,
                          children,
                          ...restProps
                      }) => {
    const inputNode = inputType === 'number' ? <InputNumber min={0} max={100}/> : (inputType === 'select' ?
        <Select><Option value={1}>女</Option><Option value={0}>男</Option></Select> : <Input/>);
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{
                        margin: 0,
                    }}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

//函数式子组件
const StaffEditableTable = () => {
    const originData = [];
    for (let i = 0; i < 100; i++) {
        originData.push({
            key: i.toString(),
            staff_name: `张三${i}`,
            gender: 0,
            age: 32,
            unit: `单位 ${i}`,
        });
    }

    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [initialization, setInitialization] = useState(true);

    const getStaff = () => {
        request({
            method: 'post',
            url: 'get_staff/',
            data: {
                "condition": "all",
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let newData = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    newData.push({
                        key: response.data.list[i]['pk'],
                        staff_name: response.data.list[i]['fields']['staff_name'],
                        gender: response.data.list[i]['fields']['gender'],
                        age: response.data.list[i]['fields']['age'],
                        unit: response.data.list[i]['fields']['unit'],
                    });
                }
                setData(newData);
            } else {
                message.error('获取staff失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取staff失败2:' + error, 3);
        });
    };
    if (initialization) {
        getStaff();
        setInitialization(false);
    }

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const handleDelete = (staff_id) => {
        const post_data = {
            "staff_ids": [staff_id]
        };
        request({
            method: 'post',
            url: 'delete_staff/',
            data: post_data,
        }).then(function (response) {
            if (response.data.code === 0) {
                const newData = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].key !== staff_id) newData.push(data[i]);
                }
                setData(newData);
                message.success('删除成功', 3);
            } else {
                message.error('删除staff失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('删除staff失败2:' + error, 3);
        });
    };

    const handleAdd = () => {
        const post_data = {
            "isEdit": false,
            "values": {
                "staff_name": "---",
                "gender": 1,
                "age": 0,
                "unit": ""
            }
        };
        request({
            method: 'post',
            url: 'add_staff/',
            data: post_data,
        }).then(function (response) {
            if (response.data.code === 0) {
                console.log("new_staff", response.data)
                const newData = {
                    key: response.data.list[0]['pk'],
                    staff_name: response.data.list[0]['fields']['staff_name'],
                    gender: response.data.list[0]['fields']['gender'],
                    age: response.data.list[0]['fields']['age'],
                    unit: response.data.list[0]['fields']['unit'],
                };
                setData([newData, ...data]);
                message.success('添加成功', 3);
            } else {
                message.error('添加staff失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('添加staff失败2:' + error, 3);
        });
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();//编辑后的那一行，但没有key
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);

            if (index > -1) {
                const item = newData[index];
                const post_data = {
                    "isEdit": true,
                    "staff_id": item.key,
                    "values": {
                        "staff_name": row.staff_name,
                        "gender": row.gender,
                        "age": row.age,
                        "unit": row.unit
                    }
                };
                request({
                    method: 'post',
                    url: 'add_staff/',
                    data: post_data,
                }).then(function (response) {
                    if (response.data.code === 0) {
                        // console.log(response.data)
                        newData.splice(index, 1, {...item, ...row});
                        setData(newData);
                        setEditingKey('');
                        message.success('修改成功', 3);
                    } else {
                        message.error('修改staff失败1:' + response.data.msg, 3)
                    }
                }).catch(function (error) {
                    message.error('修改staff失败2:' + error, 3);
                });
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
                message.error('修改staff失败3:', 3);
            }
        } catch (errInfo) {
            message.error('修改staff失败4:' + errInfo, 3);
        }
    };

    const columns = [
        {
            title: '姓名',
            dataIndex: 'staff_name',
            width: '20%',
            editable: true,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: '15%',
            editable: true,
            render: gender => gender === 0 ? '男' : '女'
        },
        {
            title: '年龄',
            dataIndex: 'age',
            width: '15%',
            editable: true,
        },
        {
            title: '单位',
            dataIndex: 'unit',
            width: '20%',
            editable: true,
            render: unit => (
                <Tooltip placement="topLeft" title={unit}>
                    {unit}
                </Tooltip>
            ),
        },
        {
            title: '编辑',
            dataIndex: 'edit',
            width: '20%',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
            <a
                href="javascript:;"
                onClick={() => save(record.key)}
                style={{
                    marginRight: 8,
                }}
            >
            保存
            </a>
            <Popconfirm title="取消编辑？" onConfirm={cancel}>
            <a>取消</a>
            </Popconfirm>
            </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        编辑
                    </Typography.Link>
                );
            },
        },
        {
            title: '删除',
            dataIndex: 'delete',
            width: '10%',
            render: (_, record) => (
                <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.key)}>
                    <Button danger type="link">
                        删除
                    </Button>
                </Popconfirm>
            ),
        }
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'gender' ? 'select' : (col.dataIndex === 'age' ? 'number' : 'text'),
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    return (
        <>
            <Button
                type='primary'
                style={{marginTop: '2%', marginBottom: '1%'}}
                onClick={handleAdd}
            >
                添加
            </Button>
            <Form form={form} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    bordered
                    dataSource={data}
                    columns={mergedColumns}
                    pagination={{
                        onChange: cancel,
                        defaultPageSize: 10,
                        showTotal: total => `共 ${total} 条`,
                        showSizeChanger: true,
                    }}
                />
            </Form>
        </>
    );
};

export default StaffEditableTable;
