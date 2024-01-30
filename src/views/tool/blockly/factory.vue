<template>
    <i-frame v-model:src="url"></i-frame>

</template>
 
<script setup>
import iFrame from '@/components/iFrame'
const url = ref("/blockly/blockfactory/index.html") 




onMounted(() => {

})
</script>
 