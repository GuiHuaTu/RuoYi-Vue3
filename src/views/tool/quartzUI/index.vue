<template>
   <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import iFrame from '@/components/iFrame'

// const url = ref(import.meta.env.VITE_APP_BASE_API + "/QuartzUI") 
const url = ref(import.meta.env.VITE_APP_BASE_Backend_Url + "/QuartzUI") 

</script>
