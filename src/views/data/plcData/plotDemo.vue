
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
            <el-form-item label="PLC代码" prop="plcCode" :rules="rules.plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode" :rules="rules.tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="检索名" prop="field" :rules="rules.field">
                <el-input v-model="queryParams.field" placeholder="请输入检索名" clearable style="width: 125px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-row>
                <el-form-item label="起止时间" prop="dateRange" :rules="rules.dateRange" style="width: 440px">
                    <el-date-picker  ref="datePick" v-model="queryParams.dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange"
                        range-separator="-" :shortcuts="shortcuts" start-placeholder="开始日期"
                        end-placeholder="结束日期" ></el-date-picker>
                </el-form-item>

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
                                Plot.lineY(lineYList, { x: '_time', y: '_value' }),
                            ],
                        }" />
                    </div>
                </el-collapse-item>
                <el-collapse-item title="Table" name="2">
                    <div>


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
import { parseTime, getDate, getTime, getDateTime } from '@/utils/tool'

import { queryByFluxQuery } from "@/api/influxDb/influx";
import { ref, inject } from "vue";

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


const shortcuts = inject('shortcuts');
const dateRangeValidate = inject('dateRangeValidate');
const isNullValidate = inject('dateRangeValidate');
const numberValidate = inject('dateRangeValidate');
 
const data = reactive({
    form: {},
    fluxQuery: {
        query: undefined,
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange:'',
        plcCode: 'S1500',
        tagCode: 'Tag_1',
        field: 'tag_value',
        aggregateFun: 'last',
        periodUnit: 's',
        period: 5,
        startTime: '',
        stopTime: '',
    },
    rules: {
        plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        field: [{ required: true, message: "不能为空", trigger: "blur" }],
        period: [
            { required: true, message: "不能为空", trigger: "blur" },
            { type: 'number', required: true, message: "请输入数字！", trigger: "blur" },
            { required: true, message: "请输入数字", validator: numberValidate, trigger: "blur" },
        ],
        periodUnit: [{ required: true, message: "不能为空", trigger: "blur" }],
        aggregateFun: [{ required: true, message: "不能为空", validator: isNullValidate, trigger: "blur" }],
        dateRange: [{ required: true, message: "请选择起止时间", validator: dateRangeValidate, trigger: "blur" }],
    },
});

const { queryParams, form, fluxQuery, rules } = toRefs(data);

const activeNames = ref(['1', '2'])


/** 查询列表 */
function getList() {
    loading.value = true;

    queryParams.value.startTime = queryParams.value.dateRange[0]
    queryParams.value.stopTime = queryParams.value.dateRange[1]
    // queryPlcLog(queryParams.value).then(response => {
    //     lineYList.value = response.data;
    //     total.value = response.total;
    //     loading.value = false;
    // });

    var bucketName = ref('scada');   //数据库名
    var measurement = ref('plc_log');  //表名
    var startTime = ref(queryParams.value.dateRange[0]);    //开始时间
    var endTime = ref(queryParams.value.dateRange[1]);      //结束时间
    var plc_code = ref(queryParams.value.plcCode);     //plc设备名
    var tag_code = ref(queryParams.value.tagCode);     //点位名
    var period = ref(queryParams.value.period);          //X轴时间间隔
    var periodUnit = ref(queryParams.value.periodUnit);    //间隔时间单位 s m h d 
    var createEmpty = ref(false);  //是否填充缺失值 true false
    var aggregateFun = ref(queryParams.value.aggregateFun);    //aggregate Function 聚合方法
    var yieldName = aggregateFun;
    var start = ref(parseTime(startTime.value, '{y}-{m}-{d}T{h}:{i}:{s}Z'));
    var stop = ref(parseTime(endTime.value, '{y}-{m}-{d}T{h}:{i}:{s}Z'));
    fluxQuery.value.query = `from(bucket: \"${bucketName.value}\")` +
        `|> range(start: time(v: \"${start.value}\"), stop: time(v: \"${stop.value}\"))` +
        `|> filter(fn: (r) => r[\"_measurement\"] == \"${measurement.value}\")` +
        `|> filter(fn: (r) => r[\"plc_code\"] == \"${plc_code.value}\")` +
        `|> filter(fn: (r) => r[\"tag_code\"] == \"${tag_code.value}\")` +
        `|> aggregateWindow(every: ${period.value}${periodUnit.value}, fn: ${aggregateFun.value}, createEmpty: ${createEmpty.value})` +
        `|> yield(name: \"${yieldName.value}\")`;

    console.log(fluxQuery.value.query);
    queryByFluxQuery(fluxQuery.value).then(response => {
        lineYList.value = response.data;
        total.value = response.total;
        loading.value = false;
    });
}
/** 搜索按钮操作 */
function handleQuery() {
    proxy.$refs["queryRef"].validate(valid => {
        if (valid) {
            queryParams.value.pageNum = 1;
            getList();
        }
    });
}
/** 重置按钮操作 */
function resetQuery() {
    queryParams.value.dateRange = [];
    proxy.resetForm("queryRef");
    handleQuery();
}
</script>
