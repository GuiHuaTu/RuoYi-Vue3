
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
            <el-form-item label="PLC代码" prop="plcCode" :rules="rules.plcCode">
                <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Tag代码" prop="tagCode" :rules="rules.tagCode">
                <el-input v-model="queryParams.tagCode" placeholder="请输入Tag代码" clearable style="width: 150px"
                    @keyup.enter="handleQuery" />
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
                            active-text="是" inactive-text="否"  @change="aggregateQueryChange"/>
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
                    <template #title>Chart<el-icon class="header-icon">
                            <info-filled />
                        </el-icon>
                    </template>
                    <div id="mainLine">
                    </div>
                </el-collapse-item>
                <el-collapse-item title="Table" name="2">
                    <div id="mainLineDemo">
                    </div>
                </el-collapse-item>
            </el-collapse>

        </div>
    </div>
</template>


<style scoped>
/* 样式这里要设置长宽，不然显示不出来 */
#mainLineDemo {
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

import echartLineDemo from "./js/echartLineDemo.js";
import echartLinePlc from "./js/echartLinePlc.js";
import { getList as getPlcList } from "./js/echartLinePlc.js";
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
const startEndShow = ref(false);

const { proxy } = getCurrentInstance(); 
const { sys_window_period_unit } = proxy.useDict("sys_window_period_unit");
const { sys_aggregate_function } = proxy.useDict("sys_aggregate_function");
const { sys_plottimer_range } = proxy.useDict("sys_plottimer_range");


const shortcuts = inject('shortcuts');
const dateRangeValidate = inject('dateRangeValidate');
const isNullValidate = inject('dateRangeValidate');
const numberValidate = inject('dateRangeValidate'); 


const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        plcCode: 'S1500',
        tagCode: 'Tag_1',
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
            { required: true, message: "请输入数字", validator: numberValidate, trigger: "blur" },
        ],
        periodUnit: [{ required: true, message: "不能为空", trigger: "blur" }],
        aggregateFun: [{ required: true, message: "不能为空", validator: isNullValidate, trigger: "blur" }],
        dateRange: [{ required: true, message: "不能为空", trigger: "blur" }],
        customDateRange: [{ required: true, message: "请选择起止时间", validator: dateRangeValidate, trigger: "blur" }],
    },
});
const dataLine = [];

const { queryParams, form, rules } = toRefs(data);

const activeNames = ref(['1', '2'])


/** 查询列表 */
function getList() {
    loading.value = true;

    if (queryParams.value.dateRange == 'customRange') {
        queryParams.value.startTime = queryParams.value.customDateRange[0]
        queryParams.value.stopTime = queryParams.value.customDateRange[1]
    }
    
    if (queryParams.value.aggregateQuery) {
        rules.value['aggregateQuery'][0].required = true;
    } else {
        rules.value['aggregateQuery'][0].required = false;
    }

    var aggregate = ref('');
    if (queryParams.value.aggregateQuery) {
        aggregate.value = `|> aggregateWindow(every: ${period.value}${periodUnit.value}, fn: ${aggregateFun.value}, createEmpty: ${createEmpty.value})`+
         `|> yield(name: \"${yieldName.value}\")`;
    } else {
        aggregate.value = '';
    }

    getPlcList(queryParams.value);

}
/** 搜索按钮操作 */
function handleQuery() {

    if (queryParams.value.dateRange == 'customRange') {
        rules.value['customDateRange'][0].required = true;
    } else {
        rules.value['customDateRange'][0].required = false;
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


onMounted(async () => {
    setTimeout(() => {
        handleQuery();
        echartLineDemo();
        echartLinePlc();
    }, 1000)
})

</script>
