import type { RouteRecordRaw } from "vue-router";

const componentsRouter: RouteRecordRaw[] = [
    {
        path: "module2/somePage/index",
        component: async () => await import(/* webpackChunkName: "module2" */ "@/views/module2/somePage/index.vue"),
        name: "Module2SomePage",
        meta: {
            title: "模块 1 页面",
        },
    },
];

export default componentsRouter;
