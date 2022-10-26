import React, {useState} from "react";
import request from "../../request"
import 'antd/dist/antd.css';
import {ChartCard, MiniArea, Pie} from 'ant-design-pro/lib/Charts';
import moment from 'moment';
import {useLocation} from "react-router-dom";
import 'ant-design-pro/dist/ant-design-pro.css';
import {
    message,
    Col,
    Row,
    Card
} from "antd";

message.config({
    top: 150
});


const Home = () => {
    const [projectData, setProjectData] = useState([]);
    const [projectCount, setProjectCount] = useState(0);
    const [videoData, setVideoData] = useState([]);
    const [videoCount, setVideoCount] = useState(0);
    const [defectData, setDefectData] = useState([]);
    const [defectCount, setDefectCount] = useState(0);
    const [statisticLoading, setStatisticLoading] = useState(true);
    const [defectDetailData, setDefectDetailData] = useState([]);
    const location = useLocation();
    if (!location.state) {
        location.state = true;
        getHomeStatistic();
    }

    function getHomeStatistic() {
        request({
            method: "get",
            url: "get_home_statistic/",
        }).then(function (response) {
            if (response.data.code === 0) {
                setProjectCount(response.data.data.project_count);
                setVideoCount(response.data.data.video_count);
                setDefectCount(response.data.data.defect_count);
                const visitData1 = [];
                for (let i = 0; i < response.data.data.project_statistic.length; i += 1) {
                    visitData1.push({
                        x: moment(response.data.data.project_statistic[i].time).format('YYYY-MM-DD'),
                        y: response.data.data.project_statistic[i].count,
                    });
                }
                setProjectData(visitData1);
                const visitData2 = [];
                for (let i = 0; i < response.data.data.video_statistic.length; i += 1) {
                    visitData2.push({
                        x: moment(response.data.data.video_statistic[i].time).format('YYYY-MM-DD'),
                        y: response.data.data.video_statistic[i].count,
                    });
                }
                setVideoData(visitData2);
                const visitData3 = [];
                for (let i = 0; i < response.data.data.defect_statistic.length; i += 1) {
                    visitData3.push({
                        x: moment(response.data.data.defect_statistic[i].time).format('YYYY-MM-DD'),
                        y: response.data.data.defect_statistic[i].count,
                    });
                }
                setDefectData(visitData3);
                const newDefectDetailData = [
                    {x: 'AJ（暗接）', y: 0,},
                    {x: 'BX（变形）', y: 0,},
                    {x: 'CJ（沉积）', y: 0,},
                    {x: 'CK（错口）', y: 0,},
                    {x: 'CQ（残墙）', y: 0,},
                    {x: 'CR（穿入）', y: 0,},
                    {x: 'FS（腐蚀）', y: 0,},
                    {x: 'FZ（浮渣）', y: 0,},
                    {x: 'JG（结垢）', y: 0,},
                    {x: 'PL（破裂）', y: 0,},
                    {x: 'QF（起伏）', y: 0,},
                    {x: 'SG（树根）', y: 0,},
                    {x: 'SL（渗漏）', y: 0,},
                    {x: 'TJ（脱节）', y: 0,},
                    {x: 'TL（脱落）', y: 0,},
                    {x: 'ZW（障碍物）', y: 0,}
                ];
                for (let i = 0; i < response.data.data.defect_detail.length; i++) {
                    newDefectDetailData[i].y = response.data.data.defect_detail[i];
                }
                setDefectDetailData(newDefectDetailData);
                setStatisticLoading(false);
            } else {
                message.error("获取统计失败1:" + response.data.msg + '刷新重试', 3);
            }
        }).catch(function (error) {
            // message.error("获取统计失败2:" + error + '刷新重试', 3);
            getHomeStatistic();
        });
    }

    return (
        <Card title="统计信息" bordered={true} loading={statisticLoading}>
            <Row gutter={16}>
                <Col span={8}>
                    <ChartCard title="工程数量" total={projectCount} contentHeight={70}>
                        <MiniArea line height={60} data={projectData}/>
                    </ChartCard>
                </Col>
                <Col span={8}>
                    <ChartCard title="视频数量" total={videoCount} contentHeight={70}>
                        <MiniArea line height={60} data={videoData}/>
                    </ChartCard>
                </Col>
                <Col span={8}>
                    <ChartCard title="缺陷数量" total={defectCount} contentHeight={70}>
                        <MiniArea line height={60} data={defectData}/>
                    </ChartCard>
                </Col>
            </Row>
            <Row gutter={22}>
                <Col span={22}>
                    <Pie
                        hasLegend
                        title="缺陷统计"
                        subTitle="缺陷统计"
                        total={() => (
                            <span>{defectCount}</span>
                        )}
                        data={defectDetailData}
                        valueFormat={val => <span>{val}</span>}
                        height={600}
                    />,
                </Col>
            </Row>
        </Card>
    )
};

export default Home;
