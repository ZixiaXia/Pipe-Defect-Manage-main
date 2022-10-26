import React from 'react';
import request from "../../../request";
import 'antd/dist/antd.css';
import './style.css'
import {
    Button,
    message,
    Card,
    Image,
    notification,
    Select
} from 'antd';
import {
    QuestionCircleTwoTone,
} from '@ant-design/icons';
// import ReactRough, {Rectangle} from 'react-rough';//https://roughjs.com/
//这样导入import rough from 'roughjs';报错：roughjs__WEBPACK_IMPORTED_MODULE_10___default.a.canvas is not a function
import rough from 'roughjs/bundled/rough.esm.js';//https://roughjs.com/

const {Option} = Select;

message.config({
    top: 200
});

class DefectDraw extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            defectId: this.props.defectId,//父组件传递来的参数
            initialization: false,//是否初始化
            hasSaved: true,//是否保存
            imgData: this.props.imgData,
            mouseDownX: -1,//鼠标按下时的位置
            mouseDownY: -1,
            mouseNowX: -1,//鼠标当前位置
            mouseNowY: -1,
            isDrawing: false,//是否正在绘制
            rects: [],//所有的rects，{bbox_id， x, y, width, height, defect_type_id}
            isClickRect: false,//是否点击某个矩形
            clickRectIndex: -1,//当前点击的矩形下标
            selectDefectType: 1,//当前选择的标注缺陷
            colors: [
                "rgba(58, 161, 255, 0.3)",
                "rgba(136, 209, 234, 0.3)",
                "rgba(54, 203, 203, 0.3)",
                "rgba(130, 223, 190, 0.3)",
                "rgba(78, 203, 115, 0.3)",
                "rgba(172, 223, 130, 0.3)",
                "rgba(251, 212, 55, 0.3)",
                "rgba(234, 166, 116, 0.3)",
                "rgba(242, 99, 123, 0.3)",
                "rgba(220, 129, 210, 0.3)",
                "rgba(151, 95, 229, 0.3)",
                "rgba(159, 139, 240, 0.3)",
                "rgba(82, 84, 207, 0.3)",
                "rgba(136, 145, 236, 0.3)",
                "rgba(67, 81, 136, 0.3)",
                "rgba(145, 176, 234, 0.3)",
            ],
        }
        // this.imgRef = React.createRef();//类组件使用ref
        //必须bind，否则this为undefined，无法访问this.state等 https://swsinswsin.medium.com/typeerror-cannot-read-property-state-of-undefined-ab77e924f992
        this.save = this.save.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseClick = this.mouseClick.bind(this);
        this.deleteRect = this.deleteRect.bind(this);
        this.drawAllRects = this.drawAllRects.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChangeDefectType = this.onChangeDefectType.bind(this);
    }

    //页面加载完成后
    //被调用了两次
    componentDidMount() {
        if (this.initialization === true) return;
        this.setState({
            initialization: true,
        });
        //设置按键绑定
        document.addEventListener("keydown", this.onKeyDown);
        //获取所有的bbox
        var self = this;
        request({
            method: 'post',
            url: 'get_bbox/',
            data: {
                "condition": "all",
                "defect_id": this.state.defectId,
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                let newRects = [];
                for (let i = 0; i < response.data.list.length; i++) {
                    newRects.push({
                        bbox_id: response.data.list[i].pk,
                        x: response.data.list[i]['fields'].x,
                        y: response.data.list[i]['fields'].y,
                        width: response.data.list[i]['fields'].width,
                        height: response.data.list[i]['fields'].height,
                        defect_type_id: response.data.list[i]['fields'].defect_type_id
                    });
                }
                self.setState({
                    rects: newRects,
                });
                self.drawAllRects();
            } else {
                message.error('获取bboxes失败1:' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('获取bboxes失败2:' + error, 3);
        });
    }

    onKeyDown(e) {
        // console.log(e)
        if (e.keyCode === 46) {//delete
            this.deleteRect();
        }
    }

    save() {
        if (this.state.rects.length === 0) {
            message.success('保存成功', 3);
            return;
        }
        const self = this;//如此在axios中使用this
        let data = {
            "isEdit": false,
            "values": this.state.rects,
            "defect_id": this.state.defectId
        };
        request({
            method: 'post',
            url: 'add_bbox/',
            data: data,
        }).then(function (response) {
            if (response.data.code === 0) {
                //获取bbox_id后添加进rects里
                let newRects = [];
                for (let i = 0; i < response.data.data.length; i++) {
                    newRects.push({
                        bbox_id: response.data.data[i].bbox_id,
                        x: response.data.data[i].x,
                        y: response.data.data[i].y,
                        width: response.data.data[i].width,
                        height: response.data.data[i].height,
                        defect_type_id: response.data.data[i].defect_type_id
                    });
                }
                self.setState({
                    rects: newRects,
                    hasSaved: true,
                });
                message.success('保存成功', 3);
            } else {
                message.error('保存失败1:' + response.data.msg, 3);
            }
        }).catch(function (error) {
            message.error('保存失败2:' + error, 3);
        });
    }

    mouseDown({nativeEvent}) {
        this.setState({
            mouseDownX: nativeEvent.offsetX,
            mouseDownY: nativeEvent.offsetY,
            isDrawing: true,
        });
        if (this.state.isClickRect) {
            this.setState({
                isClickRect: false,
            });
            this.drawAllRects();
        }
    }

    mouseUp({nativeEvent}) {
        this.setState({
            isDrawing: false,
        });
        const nowX = nativeEvent.offsetX;
        const nowY = nativeEvent.offsetY;
        const img = document.getElementById('myImg');
        const imgHeight = img.offsetHeight;
        const imgWidth = img.offsetWidth;
        if (nowX > imgWidth || nowY > imgHeight) return;//超出图像边界之外
        const rectX = Math.min(this.state.mouseDownX, nowX);
        const rectY = Math.min(this.state.mouseDownY, nowY);
        const rectW = Math.abs(this.state.mouseDownX - nowX);
        const rectH = Math.abs(this.state.mouseDownY - nowY);
        const svg = document.getElementById('mySvg');
        const roughSvg = rough.svg(svg);
        if (!this.state.rects.includes([rectX, rectY, rectW, rectH]) && rectW !== 0 && rectH !== 0) {//当前没有该矩形，则绘制
            this.state.rects.push({
                bbox_id: -1,
                x: rectX,
                y: rectY,
                width: rectW,
                height: rectH,
                defect_type_id: this.state.selectDefectType
            });
            this.setState({
                rects: this.state.rects,
                hasSaved: false,
            })
            this.drawAllRects();
        }
    }

    mouseMove({nativeEvent}) {
        if (!this.state.isDrawing) return;
        const nowX = nativeEvent.offsetX;
        const nowY = nativeEvent.offsetY;
        if (nowX === this.state.mouseNowX && nowY === this.state.mouseNowY) return;
        this.setState({
            mouseNowX: nowX,
            mouseNowY: nowY,
        });
        const img = document.getElementById('myImg');
        const imgHeight = img.offsetHeight;
        const imgWidth = img.offsetWidth;
        if (nowX > imgWidth || nowY > imgHeight) return;//超出图像边界之外
        const rectX = Math.min(this.state.mouseDownX, nowX);
        const rectY = Math.min(this.state.mouseDownY, nowY);
        const rectW = Math.abs(this.state.mouseDownX - nowX);
        const rectH = Math.abs(this.state.mouseDownY - nowY);
        const svg = document.getElementById('mySvg');
        this.drawAllRects();
        const roughSvg = rough.svg(svg);
        svg.appendChild(roughSvg.rectangle(rectX, rectY, rectW, rectH, {
            fill: this.state.colors[this.state.selectDefectType - 1],
            fillStyle: 'solid',
            roughness: 0
        }));
    }

    mouseClick({nativeEvent}) {
        // if (this.state.isDrawing) return;
        const nowX = nativeEvent.offsetX;
        const nowY = nativeEvent.offsetY;
        //判断当前点击在哪个矩形内
        let index = -1;
        for (let i = 0; i < this.state.rects.length; i++) {
            if (nowX > this.state.rects[i].x && nowX < this.state.rects[i].x + this.state.rects[i].width
                && nowY > this.state.rects[i].y && nowY < this.state.rects[i].y + this.state.rects[i].height) {
                index = i;
                // break;
            }
        }
        // console.log(index);
        if (index === -1) {//没点击矩形
            return;
        }
        const svg = document.getElementById('mySvg');
        this.drawAllRects();//清除标记的矩形
        this.setState({
            isClickRect: true,
        });
        const roughSvg = rough.svg(svg);
        //标记矩形
        const rectX = this.state.rects[index].x;
        const rectY = this.state.rects[index].y;
        const rectW = this.state.rects[index].width;
        const rectH = this.state.rects[index].height;
        svg.appendChild(roughSvg.rectangle(rectX, rectY, rectW, rectH, {
            fillStyle: 'sunburst',
            stroke: 'white',
            strokeWidth: 3,
            roughness: 0
        }));
        this.setState({
            clickRectIndex: index,
        });
    }

    deleteRect() {
        if (this.state.isClickRect === false || this.state.clickRectIndex === -1 || this.state.clickRectIndex >= this.state.rects.length) return;
        if (this.state.rects[this.state.clickRectIndex].bbox_id === -1) {//如果该bbox没有保存，则直接删除
            this.state.rects.splice(this.state.clickRectIndex, 1);//删除该矩形
            let flag = true;
            for (let i = 0; i < this.state.rects.length; i++) {//检查是否有未保存的bbox
                if (this.state.rects[i].bbox_id === -1) {
                    flag = false;
                    break;
                }
            }
            this.setState({
                isClickRect: false,
                clickRectIndex: -1,
                rects: this.state.rects,
                hasSaved: flag,
            });
            //重新绘制所有矩形
            this.drawAllRects();
            return;
        }
        const self = this;
        request({
            method: 'post',
            url: 'delete_bbox/',
            data: {
                "bbox_ids": [self.state.rects[self.state.clickRectIndex].bbox_id],
            },
        }).then(function (response) {
            if (response.data.code === 0) {
                self.state.rects.splice(self.state.clickRectIndex, 1);//删除该矩形
                let flag = true;
                for (let i = 0; i < self.state.rects.length; i++) {//检查是否有未保存的bbox
                    if (self.state.rects[i].bbox_id === -1) {
                        flag = false;
                        break;
                    }
                }
                self.setState({
                    isClickRect: false,
                    clickRectIndex: -1,
                    rects: self.state.rects,
                    hasSaved: flag,
                });
                //重新绘制所有矩形
                self.drawAllRects();
            } else {
                message.error('删除失败1：' + response.data.msg, 3)
            }
        }).catch(function (error) {
            message.error('删除失败2：' + error, 3);
        });
    }

    info() {
        notification.open({
            message: '提示',
            description: '添加：按住鼠标左键绘制。删除：点击矩形框，然后点击“删除”按钮或键盘“Del”键删除\n',
            duration: 5,
            top: 200
        });
    }

    drawAllRects() {
        const svg = document.getElementById('mySvg');
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }
        const roughSvg = rough.svg(svg);
        for (let i = 0; i < this.state.rects.length; i++) {
            svg.appendChild(roughSvg.rectangle(this.state.rects[i].x, this.state.rects[i].y, this.state.rects[i].width, this.state.rects[i].height, {
                fill: this.state.colors[this.state.rects[i].defect_type_id - 1],
                fillStyle: 'solid',
                roughness: 0
            }));
        }
    }

    onChangeDefectType(value) {
        this.setState({
            selectDefectType: value
        });
    }

    render() {
        return (
            <div>
                <Card bordered={false}>
                    <Button style={{float: "right"}} type="link" icon={<QuestionCircleTwoTone/>} onClick={this.info}/>
                    <Button size="meddle" type="link" style={{float: "right"}} danger onClick={this.deleteRect}>
                        删除
                    </Button>
                    <Button size="meddle" type="primary" style={{float: "right"}} onClick={this.save}>
                        保存
                    </Button>
                    <Select onChange={this.onChangeDefectType} style={{float: "right", width: 200}} defaultValue={1}>
                        <Option value={1}>AJ（支管暗接）</Option>
                        <Option value={2}>BX（变形）</Option>
                        <Option value={3}>CJ（沉积）</Option>
                        <Option value={4}>CK（错口）</Option>
                        <Option value={5}>CQ（残墙、坝根）</Option>
                        <Option value={6}>CR（异物穿入）</Option>
                        <Option value={7}>FS（腐蚀）</Option>
                        <Option value={8}>FZ（浮渣）</Option>
                        <Option value={9}>JG（结垢）</Option>
                        <Option value={10}>PL（破裂）</Option>
                        <Option value={11}>QF（起伏）</Option>
                        <Option value={12}>SG（树根）</Option>
                        <Option value={13}>SL（渗漏）</Option>
                        <Option value={14}>TJ（脱节）</Option>
                        <Option value={15}>TL（接口材料脱落）</Option>
                        <Option value={16}>ZW（障碍物）</Option>
                    </Select>
                </Card>
                <Card style={{position: "relative"}}>
                    <svg
                        id='mySvg'
                        style={{zIndex: 10, position: "absolute", height: "100%", width: "100%"}}
                        onMouseDown={this.mouseDown}
                        onMouseUp={this.mouseUp}
                        onMouseMove={this.mouseMove}
                        onClick={this.mouseClick}
                    />
                    <Image
                        className="can-not-select"
                        id="myImg"
                        height="100%"
                        preview={false}
                        src={this.state.imgData}
                        fallback="data:image/png;base64,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"
                        style={{pointerEvents: "none"}}
                    >
                    </Image>
                </Card>
            </div>
        );
    }
}

export default DefectDraw;
