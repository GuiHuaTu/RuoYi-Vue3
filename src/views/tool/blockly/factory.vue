<template>
    <div>
        <iframe src="/blockly/blockfactory/index.html" id="mobsf" frameborder="0"
            style="position:absolute;"></iframe>
   
    </div>
</template>
 
<script setup>


/**
* iframe-宽高自适应显示   
*/
function changeMobsfIframe() {
    const mobsf = document.getElementById('mobsf');
    const deviceWidth = document.body.clientWidth;
    const deviceHeight = document.body.clientHeight;
    mobsf.style.width = (Number(deviceWidth) ) + 'px'; //数字是页面布局宽度差值
    mobsf.style.height = (Number(deviceHeight)) + 'px'; //数字是页面布局高度差
}

onMounted(() => {
    changeMobsfIframe()

    window.onresize = function () {
        changeMobsfIframe()
    }
})
</script>
 