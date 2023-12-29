
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
                    <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange"
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
                    <div id="main">
                    </div>
                </el-collapse-item>
            </el-collapse>

        </div>
    </div>
</template>


<style scoped>
/* 样式这里要设置长宽，不然显示不出来 */
#main {
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
import * as echarts from 'echarts';
onMounted(async () => {
    setTimeout(() => { aa() }, 1000)
})
const aa = () => {
    var dom = document.getElementById('main');
    var myChart = echarts.init(dom);
    window.addEventListener('resize', function () {//自适应大小
        myChart.resize(600, 400);
    });
    // 绘制图表
    myChart.setOption({
        title: {
            text: 'ECharts 入门示例'
        },
        tooltip: {},
        xAxis: {
            data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
            {
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }
        ]
    });

    var chartDomLine = document.getElementById('mainLine');
    var myChartLine = echarts.init(chartDomLine);
    var option;

    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                Math.round(value)
            ]
        };
    }
    let data = [];
    let now = new Date(1997, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
        data.push(randomData());
    }
    option = {
        title: {
            text: 'Dynamic Data & Time Axis'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return (
                    date.getDate() +
                    '/' +
                    (date.getMonth() + 1) +
                    '/' +
                    date.getFullYear() +
                    ' : ' +
                    params.value[1]
                );
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: [
            {
                name: 'Fake Data',
                type: 'line',
                showSymbol: false,
                data: data
            }
        ]
    };
    setInterval(function () {
        for (var i = 0; i < 5; i++) {
            data.shift();
            data.push(randomData());
        }
        myChartLine.setOption({
            series: [
                {
                    data: data
                }
            ]
        });
    }, 1000);

    option && myChartLine.setOption(option);
}



import { parseTime, getDate, getTime, getDateTime } from '@/utils/tool'

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
// const dateRange = ref < [Date, Date] > ([
//     new Date(2000, 10, 10, 10, 10),
//     new Date(2000, 10, 11, 10, 10),
// ]);

const { proxy } = getCurrentInstance();
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


/** 查询列表 */
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
