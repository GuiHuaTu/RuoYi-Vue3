import * as echarts from 'echarts';
import { ref, watchEffect, toValue } from 'vue'

export function createLine(elementId,dataLine) {
    /*** 折线动态图 */
    var chartDomLine = document.getElementById(elementId);
    var myChartLine = echarts.init(chartDomLine);
    var option;
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
    option && myChartLine.setOption(option);
}

export function useEchartLine(elementId,dataLine) {
    const fetchData = () => {
        createLine(toValue(elementId),toValue(dataLine))
    }

    watchEffect(() => {
        fetchData()
    })

}

