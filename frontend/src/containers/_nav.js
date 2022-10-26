const _nav = [
    {
        _tag: 'CSidebarNavItem',
        name: '主页',
        to: '/',
        icon: 'cil-home',
    },
    {
        _tag: 'CSidebarNavTitle',
        _children: ['工程管理']
    },
    {
        _tag: 'CSidebarNavItem',
        name: '工程列表',
        to: '/ProjectManage/ProjectList',
        icon: 'cil-barcode',
    },
    {
        _tag: 'CSidebarNavItem',
        name: '通用设置',
        to: '/ProjectManage/GeneralSettings',
        icon: 'cil-settings',
    },
];

export default _nav
