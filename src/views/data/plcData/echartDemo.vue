
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
                    <el-date-picker v-model="queryParams.dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange"
                        range-separator="-" :shortcuts="shortcuts" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
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
import { getList as getPlcList} from "./js/echartLinePlc.js";
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
        startTime: '',
        stopTime: '',
    },
    rules: {
        plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        field: [{ required: true, message: "不能为空", trigger: "blur" }]
    },
});
const dataLine = [];

const { queryParams, form, rules } = toRefs(data);

const activeNames = ref(['1', '2'])


/** 查询列表 */
function getList() {
    loading.value = true;
    debugger
    queryParams.value.startTime = dateRange.value[0]
    queryParams.value.stopTime = dateRange.value[1]

    getPlcList(queryParams.value);
    
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


onMounted(async () => {
    setTimeout(() => {  
        getList();
        echartLineDemo() ;
        echartLinePlc();
    }, 1000)
  })

</script>
