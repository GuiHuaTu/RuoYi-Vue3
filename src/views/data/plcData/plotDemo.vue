
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="68px">
            <el-form-item label="PLC代码" prop="plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="检索名" prop="field">
                <el-input v-model="queryParams.field" placeholder="请输入检索名" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-row>
                <el-form-item label="起止时间" style="width: 420px">
                    <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange"
                        range-separator="-" :shortcuts="shortcuts" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
                </el-form-item>

                <el-form-item label="间隔数" prop="period">
                    <el-input-number v-model="queryParams.period" :min="1" :max="30" controls-position="right" />
                </el-form-item>
                <el-form-item label="时间间隔" prop="periodUnit">
                    <el-select v-model="queryParams.periodUnit" placeholder="时间间隔单位" clearable style="width: 240px">
                        <el-option v-for="dict in sys_window_period_unit" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="聚合方法" prop="aggregateFun">
                    <el-select v-model="queryParams.aggregateFun" placeholder="聚合方法" clearable style="width: 240px">
                        <el-option v-for="dict in sys_aggregate_function" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
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
                                label: '时间'
                            },
                            y: {
                                label: '点位值',
                                grid: true
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

import { queryPlcLog, queryByFluxQuery } from "@/api/influxDb/influx";
import { ref ,inject} from "vue";

const { proxy } = getCurrentInstance();
const { sys_window_period_unit } = proxy.useDict("sys_window_period_unit");
const { sys_aggregate_function } = proxy.useDict("sys_aggregate_function");

const lineYList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const dateRange = ref('');
const shortcuts = inject('shortcuts');

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        plcCode: 'S1500',
        tagCode: 'Tag_1',
        field: 'tag_value',
        aggregateFun:'last',
        periodUnit:'s',
        period:5,
        startTime: '',
        stopTime: '',
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

    var bucketName = ref('scada');   //数据库名
    var measurement = ref('plc_log');  //表名
    var startTime = ref(dateRange.value[0]);    //开始时间
    var endTime = ref(dateRange.value[1]);      //结束时间
    var plc_code = ref(queryParams.value.plcCode);     //plc设备名
    var tag_code = ref(queryParams.value.tagCode);     //点位名
    var period = ref(queryParams.value.period);          //X轴时间间隔
    var periodUnit = ref(queryParams.value.periodUnit);    //间隔时间单位 s m h d 
    var createEmpty = ref(false);  //是否填充缺失值 true false
    var aggregateFun = ref(queryParams.value.aggregateFun);    //aggregate Function 聚合方法
    var yieldName = aggregateFun;       //
    var fluxQuery = ref(String);
    fluxQuery =`from(bucket: \"${bucketName.value}\")` +
    `|> range(start: time(v: \"${startTime.value}\"), stop: time(v: \"${endTime.value}\"))` +
    `|> filter(fn: (r) => r['_measurement'] == \"${ measurement.value}\")` +
    `|> filter(fn: (r) => r['plc_code'] == \"${ plc_code.value}\")` +
    `|> filter(fn: (r) => r['tag_code'] == \"${ tag_code.value}\")` +
    `|> aggregateWindow(every: ${ period.value}${ periodUnit.value}, fn: ${ aggregateFun.value}, createEmpty: ${ createEmpty.value})` +
    `|> yield(name: \"${ yieldName.value}\")` ;
    debugger

    queryByFluxQuery(fluxQuery).then(response => {
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
