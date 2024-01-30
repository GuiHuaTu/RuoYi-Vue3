<template>
  <div style="width: 100%;height: 100vh;">
    <mt-edit></mt-edit>
  </div>
</template>
<script setup >
import { MtEdit, leftAsideStore } from 'maotu'
import 'maotu/dist/style.css';
import demo from '/svgs/demo.svg'

// leftAsideStore.registerConfig('svg文件', [
//   {
//     id: 'demo',
//     title: '演示svg文件',
//     type: 'svg',
//     thumbnail: '/svgs/demo.svg',
//     svg: demo,
//     props: {
//       fill: {
//         type: 'color',
//         val: '#FF0000',
//         title: '填充色'
//       }
//     }
//   }
// ]);


const modulesFiles = import.meta.glob("/public/svgs/**.svg", { eager: true, as: 'raw' })
const register_config = [];
for (const key in modulesFiles) {
  //根据路径获取svg文件名
  const name = key.split("/").pop().split(".")[0];
  register_config.push({
    id: name,
    title: name,
    type: 'svg',
    thumbnail: key.replace('/public', ''),
    svg: modulesFiles[key],
    props: {
      stroke: {
        type: 'color',
        val: '#FF0000',
        title: '线条颜色' //svg 不设置stroke属性 ，不会显示描边 左侧的预览图显示不出来,想动态修改边框颜色，设置stroke="currentColor"
      },
      fill: {
        type: 'color',
        val: '#FFFFFF',//默认白色
        title: '填充色' //svg 不设置fill属性 ，左侧的预览图默认显示黑色 ,在右侧可以修改填充色，设置fill属性，则修改不了
      }
    }
  })
}

leftAsideStore.registerConfig('svg文件', register_config);
</script>