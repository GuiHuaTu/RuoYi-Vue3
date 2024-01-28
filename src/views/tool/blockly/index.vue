
<template>
  <div class="app-container">
    <el-row>
      <el-col :span="16">
        <div id="blocklyDiv" class="blocklyDiv" ref="blocklyRef"></div>

      </el-col>
      <el-col :span="6" style="padding-left: 5px;">
        <p id="code">
          <el-button type="primary" @click="showCode()">显示工作区JavaScript代码</el-button>
          <el-button type="success" @click="saveWorkspace()">保存工作区</el-button>
          <el-button type="danger" @click="clearWorkspace()">清空工作区</el-button>
          
        <div>
          <label for="workspaceInput">选择保存的工作区文件</label>
          <el-input id="workspaceInput" name="workspaceInput" type="file" multiple @change="uploadWorkspace" />
        </div>
        <pre v-html="code"></pre>
        </p>
      </el-col>
    </el-row>

  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blocklyDiv {
  height: 700px;
  /* width: 1000px; */
  text-align: left;
}
</style>

<script setup>
import { onMounted, ref, shallowRef } from "vue";
import Blockly from "blockly";
import * as Ch from 'blockly/msg/zh-hans';//导入中文包
import { javascriptGenerator } from "blockly/javascript";
import toolboxDefault from "./js/toolboxDefault.js";
import { saveAs } from 'file-saver'//导出工作区状态json文件

const props = defineProps(["options"]);
// const blocklyToolbox = ref();
// const blocklyDiv = ref();
const workspace = shallowRef();

const code = ref();
const blocklyRef = ref();

defineExpose({ workspace });

const toolbox = toolboxDefault();

// (挂载完数据)
onMounted(() => {
  // const options = props.options || {};
  // if (!options.toolbox) {
  //   options.toolbox = blocklyToolbox.value;
  // }
  Blockly.setLocale(Ch);
  workspace.value = Blockly.inject("blocklyDiv", { toolbox: toolbox })

});

/**
 * 显示工作区JavaScripy代码
 */
const showCode = () => (code.value = javascriptGenerator.workspaceToCode(workspace.value));

/**
 * 保持工作区
 */
const saveWorkspace = () => {
  // //保存和存储用户的模块 用于保存工作区状态  
  var json = JSON.stringify(Blockly.serialization.workspaces.save(workspace.value));

  const blob = new Blob([json], { type: "text/json" })
  saveAs(blob, '工作区状态.json')


};

const clearWorkspace=()=>{
  // 清空工作区的内容
  workspace.value.clear();

}

/** 
 * 上传保存的工作区 
 */
const uploadWorkspace = (e) => {
  // console.log('e.target.files', e.target.files)
  const file = e.target.files[0];

  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    var json = JSON.parse(reader.result); // reader.result为获取结果
    // //如果有变量
    // json.variables = [];
    // for (var i = 0; i < ROBTARGET.length; i++) {
    //   json.variables.push({ "name": ROBTARGET[i], "id": "VARIABLES_" + i, type: "ROBTARGET" });
    // }

    //将JSON反序列化为模块 用于将已保存的状态加载到工作区中  
    Blockly.serialization.workspaces.load(JSON.parse(json), workspace.value);
  }
};
</script>
