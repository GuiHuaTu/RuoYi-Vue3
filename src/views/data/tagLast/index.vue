
<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">

            <el-form-item label="PLC名称" prop="plcCode" :rules="rules.plcCode">
                <el-select v-model="queryParams.plcCode" placeholder="请选择PLC设备" clearable @keyup.enter="handleQuery"
                    @change="plcCodeChange">
                    <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                        :value="item.plcCode"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Tag代码" prop="plcCode" :rules="rules.tagCode">
                <el-select v-model="queryParams.tagCode" placeholder="请选择Tag代码" clearable @keyup.enter="handleQuery">
                    <el-option v-for="item in plcTagOptions" :key="item.tagCode" :label="item.tagName"
                        :value="item.tagCode"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <el-row>
                <el-form-item label="起止时间" prop="customDateRange" v-show="startEndShow" :rules="rules.customDateRange"
                    style="width: 440px">
                    <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange"
                        range-separator="-" :shortcuts="shortcuts" start-placeholder="开始日期"
                        end-placeholder="结束日期"></el-date-picker>
                </el-form-item>

            </el-row>
        </el-form>

        <div>
            <el-tabs v-model="activeTabsName" type="border-card" @tab-click="onTabClick">
                <el-tab-pane label="点位监控" name="tagLastShow">
                    <el-row :gutter="10" class="mb8">
                        <el-col :span="1.5">
                            <el-button type="warning" plain icon="Download" @click="handleExportBefore"
                                v-hasPermi="['data:tagLast:export']">导出</el-button>
                        </el-col>
                    </el-row>

                    <el-table :data="tagLastData" @selection-change="handleSelectionChange">
                        <!-- <el-table-column type="selection" width="55" align="center" /> -->
                        <!-- <el-table-column type="index" label="序号" width="50" :index="indexMethod">
                        </el-table-column> -->
                        <el-table-column label="状态" align="center">
                            <template #default="scope">
                                <div>
                                    <el-button v-if="(scope.row.tagStat == '1')" class="buttonMin" type="success"
                                        :icon="Check" size="small" circle />
                                    <el-button v-else-if="(scope.row.tagStat == '23')" class="buttonMin" type="danger"
                                        size="small" circle />
                                    <el-button v-else type="info" class="buttonMin" size="small" circle />
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="ID" align="center" prop="tagId" />
                        <el-table-column label="设备代码" align="center" prop="plcCode" />
                        <el-table-column label="点位代码" align="center" prop="tagCode" :show-overflow-tooltip="true" />
                        <el-table-column label="点位值" align="center" prop="tagValue" :show-overflow-tooltip="true" />
                        <!-- <el-table-column label="点位状态" align="center" prop="tagStat"  /> -->

                        <el-table-column label="采集时间" align="center" prop="createTime" width="240">
                            <template #default="scope">
                                <span>{{ momentTime(scope.row.createTime) }}</span>
                            </template>
                        </el-table-column>
                    </el-table>


                    <pagination v-show="total > 0" :total="total" :pageSizes="[50, 100, 150, 200, 300, 400, 500, 1000]"
                        v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getPage" />

                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>


<style scoped>
.buttonMin {
    width: 15px;
    height: 15px;
}
</style >


<script setup name="tagLast">
import { ref, inject } from "vue";
import exportExcel from "@/utils/exportTableExcel"
import print from 'print-js';
import { optionselectPlc } from "@/api/plcManage/tag";
import { parseTime, momentTime, momentUTC } from '@/utils/tool'

import { listTagLast, listTagLastNoPage } from "@/api/data/taglast";

const tagLastData = ref([]);
const tagLastDataPage = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
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
        customDateRange: '',
        startTime: '',
        stopTime: '',
    },
    rules: {
        plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
        tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],

        customDateRange: [{ required: true, message: "请选择起止时间", validator: dateRangeValidate, trigger: "blur" }],

    },
});

const { queryParams, form, fluxQuery, rules } = toRefs(data);

const activeTabsName = ref("tagLastShow")


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

    listTagLast(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
        if (response.code == 200) {
            tagLastData.value = response.data;
            total.value = response.total;
            loading.value = false;
        } else {
            proxy.$modal.msgError(response.msg);
        }
    });


}
/** 前端分页数据显示 */
function getTablePage() {
    var pageDatas = proxy.getTableData(queryParams.value.pageNum, queryParams.value.pageSize, tagLastData.value);
    tagLastDataPage.value = pageDatas.data;
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



const timeFlush = reactive({
    rangeFlush: 1000,//定义定时器间隔时间 
})
const state = reactive({
    timeInter: null,//定义定时器
})
//组件挂载的过程
onMounted(async () => {
    console.log(timeFlush.rangeFlush)
    /// 定时采集数据显示
    state.timeInter = setInterval(() => {
        listTagLast(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
            var tagLasts = response.data.map(item => ({ tagId: item.tagId, tagValue: item.tagValue }));
            tagLastData.value.forEach(element => {
                element.tagValue = tagLasts.filter(p => p.tagId == element.tagId)[0].tagValue;
                element.tagStat = tagLasts.filter(p => p.tagId == element.tagId)[0].tagStat;
                element.createTime = tagLasts.filter(p => p.tagId == element.tagId)[0].createTime;
            });
            total.value = response.total;
        });
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
        tagLastData.value,
        [
            { field: 'plcCode', displayName: '设备代码', columnSize: 5 },
            { field: 'tagCode', displayName: '点位代码', columnSize: 10 },
            { field: 'tagValue', displayName: '点位值', columnSize: 10 },
            { field: 'createTime', displayName: '采集时间', columnSize: 10 },
        ],
        queryParams.value.plcCode + '点位采集最新记录',//导出的Excel文件名
        queryParams.value.tagCode + '采集记录',//sheetName 
    );
}

getPlcList();
getList();
</script>
