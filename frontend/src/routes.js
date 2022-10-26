import React from 'react';

const Home = React.lazy(() => import('./pages/Home/Home'));
const AddProject = React.lazy(() => import('./pages/ProjectManage/ProjectList/AddProject'));
const ProjectList = React.lazy(() => import('./pages/ProjectManage/ProjectList/ProjectList'));
const LineList = React.lazy(() => import('./pages/ProjectManage/ProjectList/LineList'));
const AddLine = React.lazy(() => import('./pages/ProjectManage/ProjectList/AddLine'));
const PointList = React.lazy(() => import('./pages/ProjectManage/ProjectList/PointList'));
const AddPoint = React.lazy(() => import('./pages/ProjectManage/ProjectList/AddPoint'));
const VideoList = React.lazy(() => import('./pages/ProjectManage/ProjectList/VideoList'));
const AddVideo = React.lazy(() => import('./pages/ProjectManage/ProjectList/AddVideo'));
const DefectDetection = React.lazy(() => import('./pages/ProjectManage/ProjectList/DefectDetection'));
const GeneralSettings = React.lazy(() => import('./pages/ProjectManage/GeneralSettings/GeneralSettings'));

const routes = [
    {path: '/', exact: true, name: '主页', component: Home},
    // { path: '/ProjectManage', name: '工程管理', component: ProjectList, exact: true },
    {path: '/ProjectManage/ProjectList', exact: true, name: '工程列表', component: ProjectList},
    {path: '/ProjectManage/AddProject', exact: true, name: '添加/修改工程', component: AddProject},
    {path: '/ProjectManage/LineList', exact: true, name: '管线列表', component: LineList},
    {path: '/ProjectManage/AddLine', exact: true, name: '添加/修改管线', component: AddLine},
    {path: '/ProjectManage/PointList', exact: true, name: '管点列表', component: PointList},
    {path: '/ProjectManage/AddPoint', exact: true, name: '添加/修改管点', component: AddPoint},
    {path: '/ProjectManage/VideoList', exact: true, name: '视频列表', component: VideoList},
    {path: '/ProjectManage/AddVideo', exact: true, name: '添加/修改视频', component: AddVideo},
    {path: '/ProjectManage/DefectDetection', exact: true, name: '缺陷检测', component: DefectDetection},
    {path: '/ProjectManage/GeneralSettings', exact: true, name: '通用设置', component: GeneralSettings},
];

export default routes;
