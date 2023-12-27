import * as echarts from 'echarts';
import { queryPlcLog } from "@/api/influxDb/influx";

var dataLine = [];

/** 查询列表 */
function getList(queryParamsValue) {
    if(queryParamsValue){
        queryPlcLog(queryParamsValue).then(response => { 
            for (var i = 0; i < response.data.length; i++) {
                dataLine.push({ name: response.data[i].time, value: [response.data[i].time, response.data[i].tagValue] });
            } 
        });

    }
}

const aa = () => { 
     

    /*** 折线动态图 */
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
    let now = new Date(1997, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let value = Math.random() * 1000; 

 
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
                data: dataLine
            }
        ]
    };
    setInterval(function () {
        for (var i = 0; i < 10; i++) {
            dataLine.shift();
            getList() ; 
        }
        myChartLine.setOption({
            series: [
                {
                    data: dataLine
                }
            ]
        });
    }, 10000);

    option && myChartLine.setOption(option);
}
export { dataLine, getList }
export default aa