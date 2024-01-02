<template>
    <div style="width:auto;margin:auto;height: 300px;" id="plotLyId"></div>
</template>
    
<script setup> 
import Plotly from 'plotly.js/dist/plotly';
// import Plotly from '@/utils/plotly'

const props = defineProps({

    data: {
        required: true,
        type: Object
    },
    layout: {
        type: Object,
    },
})

// var trace1 = {
//   x: [1, 2, 3, 4],
//   y: [10, 15, 13, 17],
//   mode: 'markers'
// };

// var trace2 = {
//   x: [2, 3, 4, 5],
//   y: [16, 5, 11, 9],
//   mode: 'lines'
// };

// var trace3 = {
//   x: [1, 2, 3, 4],
//   y: [12, 9, 15, 12],
//   mode: 'lines+markers'
// };

// var data = [ trace1, trace2, trace3 ];

// var layout = {
//   // height: 400,
//   // width: 1000,
//   title:'Line and Scatter Plot'
// };
// let ctx = document.getElementById('plotLyId');

// Plotly.newPlot(ctx, props.data, props.layout);

const redrawDataValue = function (dataValue) {
    let ctx = document.getElementById('plotLyId');
    Plotly.react(ctx, dataValue, props.layout);
}
const redrawLayoutValue = function (layoutValue) {
    let ctx = document.getElementById('plotLyId');
    Plotly.react(ctx, props.data, layoutValue);
}


watch(() => props.data, value => redrawDataValue(value))
watch(() => props.layout, value => redrawLayoutValue(value))


</script> 