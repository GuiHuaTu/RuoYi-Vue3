
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
            <el-form-item label="PLC代码" prop="plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 140px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 140px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="检索名" prop="field">
                <el-input v-model="queryParams.field" placeholder="请输入检索名" clearable style="width: 140px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-row>
            <el-form-item label="起止时间" style="width: 508px">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange" range-separator="-"
                    :shortcuts="shortcuts" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
            </el-form-item>

            </el-row>
        </el-form>

        <div class="demo-collapse">
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template #title>Chart<el-icon class="header-icon">
                            <info-filled />
                        </el-icon>
                    </template>
                    <div>
                        <PlotFigure :options="{
                            x: {
                                label:'时间'
                            },
                            y: {
                                label:'点位值',
                                grid:true
                            },
                            marks: [
                                // Plot.ruleY([0]),
                                Plot.lineY(lineYList, { x: 'time', y: 'tagValue' }),
                            ],
                        }" />
                    </div>
                </el-collapse-item>
                <el-collapse-item title="Table" name="2">
                    <div>
                        <el-card class="box-card">
                            <template #header>
                                <div class="card-header">
                                    <span>Card name</span>
                                    <el-button class="button" text>Operation button</el-button>
                                </div>
                            </template>
                            <div v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</div>
                            <template #footer>Footer content</template>
                        </el-card>

                    </div>
                </el-collapse-item>
            </el-collapse>

        </div>
    </div>
</template>

<script setup>
import * as Plot from "@observablehq/plot";
import PlotFigure from "./js/PlotFigure.js";
// import penguins from "./penguins.json";//从json文件加载数据
// import { parseTime, getDate,getTime,getDateTime} from '@/utils/tool'

import { queryPlcLog } from "@/api/influxDb/influx";

const lineYList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const { proxy } = getCurrentInstance();
const dateRange = ref('');
const shortcuts = [
    {
        text: 'Last week',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        },
    },
    {
        text: 'Last month',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
        },
    },
    {
        text: 'Last 3 months',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
        },
    }
];
const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        plcCode: 'S1500',
        tagCode: 'Tag_1',
        field: 'tag_value',
        startTime:'',
        stopTime:'',
    },
    rules: {
        plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        field: [{ required: true, message: "不能为空", trigger: "blur" }]
    },
});

const { queryParams, form, rules } = toRefs(data);

const activeNames = ref(['1', '2'])


/** 查询角色列表 */
function getList() {
    loading.value = true;
    debugger
    queryParams.value.startTime = dateRange.value[0]
    queryParams.value.stopTime = dateRange.value[1]
    queryPlcLog(queryParams.value).then(response => {
        lineYList.value = response.data;
        total.value = response.total;
        loading.value = false;
    });
}
/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}
/** 重置按钮操作 */
function resetQuery() {
    dateRange.value = [];
    proxy.resetForm("queryRef");
    handleQuery();
}
</script>
