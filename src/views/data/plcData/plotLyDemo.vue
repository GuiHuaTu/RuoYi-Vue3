
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
            <!-- <el-form-item label="PLC代码" prop="plcCode" :rules="rules.plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode" :rules="rules.tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item> -->
            
            <el-form-item label="PLC名称" prop="plcCode" :rules="rules.plcCode">
                <el-select v-model="queryParams.plcCode" placeholder="请选择PLC设备" clearable @keyup.enter="handleQuery"
                    @change="plcCodeChange">
                    <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                        :value="item.plcCode"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode" :rules="rules.tagCode">
                <el-select v-model="queryParams.tagCode" placeholder="请选择Tag代码" filterable clearable
                    @keyup.enter="handleQuery">
                    <el-option v-for="item in plcTagOptions" :key="item.tagCode" :label="item.tagName"
                        :value="item.tagCode"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="检索名" prop="field" :rules="rules.field"  v-show="false">
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

        <div class="demo-collapse">
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template #title>MarkerLine<el-icon class="header-icon">
                            <info-filled />
                        </el-icon>
                    </template>
                    <div id="plotLyId"></div>
                </el-collapse-item>
                 
            </el-collapse>
        </div>
    </div>
</template>

 

<script setup>
import { momentUTC  } from '@/utils/tool'

import { queryPlcLog, queryByFluxQuery } from "@/api/influxDb/influx";
import { listTagNoPage, optionselectPlc } from "@/api/plcManage/tag";
import { ref, inject } from "vue";
import Plotly from 'plotly.js/dist/plotly';
// import Plotly from '@/utils/plotly'

const { proxy } = getCurrentInstance();
const { sys_window_period_unit } = proxy.useDict("sys_window_period_unit");
const { sys_aggregate_function } = proxy.useDict("sys_aggregate_function");
const { sys_plottimer_range } = proxy.useDict("sys_plottimer_range");


const lineYList = ref([]);
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
// const aggregateQueryShow = ref(false);


const shortcuts = inject('shortcuts');
const dateRangeValidate = inject('dateRangeValidate');
const isNullValidate = inject('isNullValidate');
const numberValidate = inject('numberValidate');

const data = reactive({
    form: {},
    fluxQuery: {
        query: undefined,
    },
    timedTasksCollector: null,
    queryParams: {
        pageNum: 1,
        pageSize: 10,
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
            { required: true, message: "不能为空", trigger: "blur" },
            { type: 'number', required: true, message: "请输入数字！", trigger: "blur" },
            { required: true, message: "请输入数字", validator: numberValidate,  trigger: "blur" },
        ],
        periodUnit: [{ required: true, message: "不能为空", trigger: "blur" }],
        aggregateFun: [{ required: true, message: "不能为空", validator: isNullValidate, trigger: "blur" }],
        dateRange: [{ required: true, message: "不能为空", trigger: "blur" }],
        customDateRange: [{ required: true, message: "请选择起止时间", validator: dateRangeValidate, trigger: "blur" }],
    },

});

const { queryParams, form, fluxQuery, rules, timedTasksCollector, } = toRefs(data);

const activeNames = ref(['1', '2'])

// const xData = computed(() => {
//     lineYList.value.map((item) => {
//         return item._time
//     });
// })
// const yData = computed(() => {
//     lineYList.value.map((item) => {
//         return item._value
//     });
// })


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



/** 查询列表 */
function getList() {
    loading.value = true;

    if (queryParams.value.dateRange == 'customRange') {
        queryParams.value.startTime = queryParams.value.customDateRange[0]
        queryParams.value.stopTime = queryParams.value.customDateRange[1]
    }
    // queryPlcLog(queryParams.value).then(response => {
    //     if (response.code == 200) {
    //         lineYList.value = response.data;
    //         total.value = response.total;
    //         loading.value = false;
    //         PlotlyShow();
    //     } else {
    //         proxy.$modal.msgError(response.msg);
    //     }
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
        start.value = momentUTC(startTime.value );
        stop.value = momentUTC(endTime.value );

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
        `|> filter(fn: (r) => r[\"_field\"] == \"${field.value}\")` +
        `|> filter(fn: (r) => r[\"plc_code\"] == \"${plc_code.value}\")` +
        `|> filter(fn: (r) => r[\"tag_code\"] == \"${tag_code.value}\")` +
                aggregate.value;

    queryByFluxQuery(fluxQuery.value).then(response => {
        if (response.code == 200) {
            lineYList.value = response.data;
            total.value = response.total;
            loading.value = false;
            
            PlotlyShow();
        } else {
            proxy.$modal.msgError(response.msg);
        }
    });

}

function PlotlyShow() {
    console.log('-----------------')
    let ctx = document.getElementById('plotLyId');
    layoutPlotLy.value.title = queryParams.value.tagCode + "历史数据";
    if (lineYList.value && lineYList.value.length > 0) {
        var x = [];
        var y = [];
        lineYList.value.forEach((item) => {
            // x.push(item._time);
            // y.push(item._value);
            x.push(item._time);
            y.push(item._value);
        });
        dataPlotLy.value[0].x = x;
        dataPlotLy.value[0].y = y;

        let ctx = document.getElementById('plotLyId');
        Plotly.react(ctx, dataPlotLy.value, layoutPlotLy.value, configPlotLy.value);
    }
    else {
        Plotly.react(ctx, [], layoutPlotLy.value, configPlotLy.value);
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
            queryParams.value.pageNum = 1;
            getList();
        }
        else {
            proxy.$modal.msgError("查询表单校验错误!");
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

// /** 多选框选中数据 */
// function handleSelectionChange(selection) {
//     ids.value = selection.map(item => item.dictId);
//     single.value = selection.length != 1;
//     multiple.value = !selection.length;
// }

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

getPlcList()
</script>
