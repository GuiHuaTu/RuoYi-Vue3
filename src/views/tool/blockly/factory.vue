<template>
 
    <i-frame v-model:src="url"></i-frame>

 </template>
 
 <script setup>
 import iFrame from '@/components/iFrame'
 
 const url = ref("../../../blockfactory/index.html") 
 console.log(url)
 </script>
 