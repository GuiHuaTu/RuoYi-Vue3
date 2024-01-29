
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
            <!-- <el-form-item label="PLC代码" prop="plcCode" :rules="rules.plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="PLC名称" prop="plcCode" :rules="rules.plcCode">
                <el-select v-model="queryParams.plcCode" placeholder="请选择PLC设备" clearable @keyup.enter="handleQuery"
                    @change="plcCodeChange">
                    <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                        :value="item.plcCode"></el-option>
                </el-select>
            </el-form-item>

            <!-- <el-form-item label="Tag代码" prop="tagCode" :rules="rules.tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item> -->

            <el-form-item label="Tag代码" prop="plcCode" :rules="rules.tagCode">
                <el-select v-model="queryParams.tagCode" placeholder="请选择Tag代码" clearable @keyup.enter="handleQuery">
                    <el-option v-for="item in plcTagOptions" :key="item.tagCode" :label="item.tagName"
                        :value="item.tagCode"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="检索名" prop="field" :rules="rules.field">
                <el-input v-model="queryParams.field" placeholder="请输入检索名" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-row>

                <el-form-item label="时间范围" prop="dateRange" :rules="rules.dateRange">
                    <el-select v-model="queryParams.dateRange" placeholder="时间范围" clearable style="width: 150px"
                        @change="dateRangeChange">
                        <el-option v-for="dict in sys_plottimer_range" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="起止时间" prop="customDateRange" v-show="startEndShow" :rules="rules.customDateRange"
                    style="width: 440px">
                    <el-date-picker v-model="queryParams.customDateRange" value-format="YYYY-MM-DD HH:mm:ss"
                        type="datetimerange" range-separator="-" :shortcuts="shortcuts" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
                </el-form-item>

                <el-form-item label="是否聚合" prop="aggregateQuery" :rules="rules.aggregateQuery">
                    <el-tooltip :content="'Switch value: ' + queryParams.aggregateQuery" placement="top">
                        <el-switch v-model="queryParams.aggregateQuery"
                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" inline-prompt
                            active-text="是" inactive-text="否" @change="aggregateQueryChange" />
                    </el-tooltip>
                </el-form-item>
                <div v-if="queryParams.aggregateQuery">
                    <el-form-item label="聚合时间" prop="period" :rules="rules.period">
                        <el-input v-model.number="queryParams.period" placeholder="" style="width: 120px">
                            <!-- <template #prepend>
                            <el-button :icon="Search" />
                        </template> -->
                            <template #append>
                                <el-select v-model="queryParams.periodUnit" clearable>
                                    <el-option v-for="dict in sys_window_period_unit" :key="dict.value" :label="dict.label"
                                        :value="dict.value" />
                                </el-select>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="聚合方法" prop="aggregateFun" :rules="rules.aggregateFun">
                        <el-select v-model="queryParams.aggregateFun" placeholder="聚合方法" clearable style="width: 100px">
                            <el-option v-for="dict in sys_aggregate_function" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>
                </div>

            </el-row>
        </el-form>
        <!-- 
        <div>
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template #title>PlotLyMarkerLine<el-icon class="header-icon">
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
                                Plot.lineY(lineYList, { x: '_time', y: '_value' }),
                            ],
                        }" />
                    </div> 

                    <div id="plotLyId"></div>

                </el-collapse-item>
                <el-collapse-item title="EchartMarkerLine" name="2">
                    <div id="mainLine">
                    </div>
                </el-collapse-item>  
            </el-collapse>

        </div> -->

        <div>
            <el-tabs v-model="activeTabsName" type="border-card" @tab-click="onTabClick">
                <el-tab-pane label="PlotLy折线图" name="plotLyShow">
                    <div id="plotLyId"></div>
                </el-tab-pane>
                <el-tab-pane label="Table表格" name="tableShow">

                    <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="warning" plain icon="Download" @click="handleExportBefore"
                            v-hasPermi="['data:plcData:export']">导出</el-button>
                    </el-col>
                    </el-row>

                    <el-table :data="lineYListPage" @selection-change="handleSelectionChange">
                        <!-- <el-table-column type="selection" width="55" align="center" /> -->
                        <el-table-column type="index" label="序号" width="50" :index="indexMethod">
                        </el-table-column>
                        <el-table-column label="设备代码" align="center" prop="plc_code" />
                        <el-table-column label="点位代码" align="center" prop="tag_code" :show-overflow-tooltip="true" />
                        <el-table-column label="点位值" align="center" prop="_value" :show-overflow-tooltip="true" />

                        <el-table-column label="采集时间" align="center" prop="_time" width="240">
                            <template #default="scope">
                                <span>{{ momentTime(scope.row._time) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="起始时间" align="center" prop="_start" width="240">
                            <template #default="scope">
                                <span>{{ parseTime(scope.row._start ) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="结束时间" align="center" prop="_stop" width="240">
                            <template #default="scope">
                                <span>{{ parseTime(scope.row._stop) }}</span>
                            </template>
                        </el-table-column>
                        <!-- <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
                                <template #default="scope">
                                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                                    v-hasPermi="['data:plcData:edit']">修改</el-button>
                                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                                    v-hasPermi="['data:plcData:remove']">删除</el-button>
                                </template>
                            </el-table-column> 
                            -->
                    </el-table>


                    <pagination v-show="total > 0" :total="total" :pageSizes="[50, 100, 150, 200, 300, 400, 500, 1000]"
                        v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
                        @pagination="getTablePage" />

                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>


<style scoped>
/* 样式这里要设置长宽，不然显示不出来 */
#mainBarDemo {
    width: 600px;
    height: 400px;
}

/* 样式这里要设置长宽，不然显示不出来 */
#mainLine {
    width: 1200px;
    height: 400px;
}
</style >


<script setup name="plcData">
import { ref, inject } from "vue";
import exportExcel from "@/utils/exportTableExcel"
import print from 'print-js';
import * as echarts from 'echarts';
import * as Plot from "@observablehq/plot";
import PlotFigure from "./js/PlotFigure.js";
import Plotly from 'plotly.js/dist/plotly';
// import Plotly from '@/utils/plotly'
import { useEchartLine } from "./js/echartLinePlc.js";
import { listTagNoPage, optionselectPlc } from "@/api/plcManage/tag";

import { parseTime, momentTime } from '@/utils/tool'

import { queryByFluxQuery } from "@/api/influxDb/influx";

const lineYList = ref([]);
const lineYListPage = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const startEndShow = ref(false);
const plcOptions = ref([]);
const plcTagOptions = ref([]);

const { proxy } = getCurrentInstance();
const { sys_window_period_unit } = proxy.useDict("sys_window_period_unit");
const { sys_aggregate_function } = proxy.useDict("sys_aggregate_function");
const { sys_plottimer_range } = proxy.useDict("sys_plottimer_range");

const shortcuts = inject('shortcuts');
const dateRangeValidate = inject('dateRangeValidate');
const isNullValidate = inject('isNullValidate');
const numberValidate = inject('numberValidate');

const data = reactive({
    form: {},
    fluxQuery: {
        query: undefined,
    },
    queryParams: {
        pageNum: 1,
        pageSize: 50,
        // plcCode: 'S1500',
        // tagCode: 'Tag_1',
        plcCode: undefined,
        tagCode: undefined,
        field: 'tag_value',
        aggregateQuery: false,
        aggregateFun: 'last',
        periodUnit: 's',
        period: 5,
        dateRange: '-1m',
        customDateRange: '',
        startTime: '',
        stopTime: '',
    },
    rules: {
        plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        field: [{ required: true, message: "不能为空", trigger: "blur" }],
        aggregateQuery: [{ required: true, message: "不能为空", trigger: "blur" }],
        period: [
            { required: true, message: "不能为空", validator: numberValidate, trigger: "blur" },
            { type: 'number', required: true, message: "请输入纯数字", trigger: "blur" }
        ],
        periodUnit: [{ required: true, message: "不能为空", trigger: "blur" }],
        aggregateFun: [{ required: true, message: "不能为空", validator: isNullValidate, trigger: "blur" }],
        dateRange: [{ required: true, message: "不能为空", trigger: "blur" }],
        customDateRange: [{ required: true, message: "请选择起止时间", validator: dateRangeValidate, trigger: "blur" }],

    },
});

const { queryParams, form, fluxQuery, rules } = toRefs(data);

const activeNames = ref(['1', '2'])
const activeTabsName = ref("plotLyShow")

const dataPlotLy = ref([{
    x: [],
    y: [],
    mode: 'lines+markers',
    line: { color: 'blue' },
    marker: {
        color: 'red',
        // size: 12
    },
}])
const layoutPlotLy = ref({
    title: 'PLC采集数据',
    xaxis: {
        title: '采集时间'
    },
    yaxis: {
        title: '点值'
    },
})
const configPlotLy = ref({
    // displayModeBar: false,//不显示右上角的按钮
    // scrollZoom: true,
    displaylogo: false //不显示plotly的logo
})

// const redrawDataValue = function (dataValue) {
// let ctx = document.getElementById('plotLyId');
// Plotly.react(ctx, dataValue, layoutPlotLy.value, configPlotLy.value);
// }
// const redrawLayoutValue = function (layoutValue) {
// let ctx = document.getElementById('plotLyId');
// Plotly.react(ctx, dataPlotLy.value, layoutValue, configPlotLy.value);
// }


// watch(() => dataPlotLy, value => redrawDataValue(value))
// watch(() => layoutPlotLy, value => redrawLayoutValue(value))


function indexMethod(index) {
    return index + 1;
}
/** 查询PLC列表 */
function getPlcList() {
    optionselectPlc().then(response => {
        plcOptions.value = response.data;
    });
}

/** plc选择 */
async function plcCodeChange(value) {
    await getTagCodeList(value);
}
/** 获取PLC的点位 */
async function getTagCodeList(value) {
    await listTagNoPage({ plcCode: value }).then(response => {
        plcTagOptions.value = response.data;
    });
}
/** 选项卡点击事件 */
function onTabClick(tab, event) {
    console.log(tab, event);
    if (tab.name == 'tableShow') {
        getTablePage();
    }
}

/** 查询列表 */
function getList() {
    loading.value = true;

    if (queryParams.value.dateRange == 'customRange') {
        queryParams.value.startTime = queryParams.value.customDateRange[0]
        queryParams.value.stopTime = queryParams.value.customDateRange[1]
    }
    // queryPlcLog(queryParams.value).then(response => {
    // if (response.code == 200) {
    //     lineYList.value = response.data;
    //     total.value = response.total;
    //     loading.value = false;
    //     PlotlyShow();
    // } else {
    //     proxy.$modal.msgError(response.msg);
    // }
    // });


    var bucketName = ref('scada');   //数据库名
    var measurement = ref('plc_log');  //表名
    var plc_code = ref(queryParams.value.plcCode);     //plc设备名
    var tag_code = ref(queryParams.value.tagCode);     //点位名
    var field = ref(queryParams.value.field);     //field
    var period = ref(queryParams.value.period);          //X轴时间间隔
    var periodUnit = ref(queryParams.value.periodUnit);    //间隔时间单位 s m h d 
    var createEmpty = ref(false);  //是否填充缺失值 true false
    var aggregateFun = ref(queryParams.value.aggregateFun);    //aggregate Function 聚合方法
    var yieldName = aggregateFun;
    var start = ref('')
    var stop = ref('')
    var range = ref('')
    if (queryParams.value.dateRange == 'customRange') {
        var startTime = ref(queryParams.value.customDateRange[0]);    //开始时间
        var endTime = ref(queryParams.value.customDateRange[1]);      //结束时间
        start.value = parseTime(startTime.value, '{y}-{m}-{d}T{h}:{i}:{s}Z');
        stop.value = parseTime(endTime.value, '{y}-{m}-{d}T{h}:{i}:{s}Z');
        range.value = `|> range(start: time(v: \"${start.value}\"), stop: time(v: \"${stop.value}\"))`;
    }
    else {
        start.value = queryParams.value.dateRange;
        range.value = `|> range(start: ${start.value})`;
    }

    var aggregate = ref('');
    if (queryParams.value.aggregateQuery) {
        aggregate.value = `|> aggregateWindow(every: ${period.value}${periodUnit.value}, fn: ${aggregateFun.value}, createEmpty: ${createEmpty.value})` +
            `|> yield(name: \"${yieldName.value}\")`;
    } else {
        aggregate.value = '';
    }

    fluxQuery.value.query = `from(bucket: \"${bucketName.value}\")` +
        range.value +
        `|> filter(fn: (r) => r[\"_measurement\"] == \"${measurement.value}\")` +
        `|> filter(fn: (r) => r[\"_field\"] == \"${plc_code.field}\")` +
        `|> filter(fn: (r) => r[\"plc_code\"] == \"${plc_code.value}\")` +
        `|> filter(fn: (r) => r[\"tag_code\"] == \"${tag_code.value}\")` +
        aggregate.value;

    queryByFluxQuery(fluxQuery.value).then(response => {
        if (response.code == 200) {
            lineYList.value = response.data;
            total.value = response.total;
            loading.value = false;
            getTablePage();
            PlotlyShow();
        } else {
            proxy.$modal.msgError(response.msg);
        }
    });
}
/** 前端分页数据显示 */
function getTablePage() {
    var pageDatas = proxy.getTableData(queryParams.value.pageNum, queryParams.value.pageSize, lineYList.value);
    lineYListPage.value = pageDatas.data;
}

function PlotlyShow() {
    console.log('-----------------')
    if (lineYList.value && lineYList.value.length > 0) {
        var x = [];
        var y = [];
        lineYList.value.forEach((item) => {
            // x.push(item._time);
            // y.push(item._value);
            x.push(momentTime(item._time));
            y.push(item._value);
        });
        dataPlotLy.value[0].x = x;
        dataPlotLy.value[0].y = y;

        let ctx = document.getElementById('plotLyId');
        Plotly.react(ctx, dataPlotLy.value, layoutPlotLy.value, configPlotLy.value);

        // //echart 方式；
        // var dataLine = [];
        // for (var i = 0; i < lineYList.value.length; i++) {
        //     dataLine.push({ name: lineYList.value[i]._time, value: [lineYList.value[i]._time, lineYList.value[i]._value] });
        // }
        // useEchartLine('mainLine', dataLine)
    }

}

/** 搜索按钮操作 */
function handleQuery() {

    if (queryParams.value.dateRange == 'customRange') {
        rules.value['customDateRange'][0].required = true;
    } else {
        rules.value['customDateRange'][0].required = false;
    }

    if (queryParams.value.aggregateQuery) {
        rules.value['aggregateQuery'][0].required = true;
    } else {
        rules.value['aggregateQuery'][0].required = false;
    }
    proxy.$refs["queryRef"].validate(valid => {
        if (valid) {
            getList();
        }
        else {
            // proxy.$modal.msgError("查询表单校验错误!");
        }
    });
}
/** 重置按钮操作 */
function resetQuery() {
    queryParams.value.dateRange = [];
    proxy.resetForm("queryRef");
    handleQuery();
}



function dateRangeChange(value) {
    if (value == 'customRange') {
        startEndShow.value = true;
    } else {
        startEndShow.value = false;
    }
}
function aggregateQueryChange(value) {
    if (value) {
        // aggregateQueryShow.value = true;
    } else {
        // aggregateQueryShow.value = false;
    }
}
const timeFlush = reactive({
    rangeFlush: 1000,//定义定时器间隔时间 
})
const state = reactive({
    timeInter: null,//定义定时器
})
//组件挂载的过程
onMounted(async () => {
    setTimeout(() => {
        handleQuery();
    }, 1000)

    console.log(timeFlush.rangeFlush)
    /// 定时采集数据显示
    state.timeInter = setInterval(() => {
        handleQuery();
    }, timeFlush.rangeFlush);
})

//组件卸载时的生命周期
onUnmounted(() => {
    if (state.timeInter) {
        clearInterval(state.timeInter) //销毁
        state.timeInter = null
    }
})

/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.dictId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 前端导出按钮操作 */
function handleExportBefore() {
    exportExcel(
            //所需要导出的数据
            lineYList.value,
            [
                { field: 'plc_code', displayName: '设备代码', columnSize: 5 },
                { field: 'tag_code', displayName: '点位代码', columnSize: 10 },
                { field: '_value', displayName: '点位值', columnSize: 10 },
                { field: '_time', displayName: '采集时间', columnSize: 10 },
                { field: '_start', displayName: '起始时间', columnSize: 10 },
                { field: '_stop', displayName: '结束时间', columnSize: 10 },
            ],
            queryParams.value.plcCode + '点位采集记录',//导出的Excel文件名
            queryParams.value.tagCode + '采集记录',//sheetName 
        );
}

getPlcList();
</script>
