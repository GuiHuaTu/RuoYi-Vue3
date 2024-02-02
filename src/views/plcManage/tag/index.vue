<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="PLC名称" prop="plcCode">
            <el-select v-model="queryParams.plcCode" placeholder="请选择PLC设备" clearable @keyup.enter="handleQuery">
               <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                  :value="item.plcCode"></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="点位组" prop="tagGroup">
            <el-select v-model="queryParams.tagGroup" placeholder="请选择监控组" clearable @keyup.enter="handleQuery">
               <el-option v-for="item in sys_tag_group" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="点位代码" prop="tagCode">
            <el-input v-model="queryParams.tagCode" placeholder="请输入点位代码" clearable @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="点位名称" prop="tagName">
            <el-input v-model="queryParams.tagName" placeholder="请输入点位名称" clearable @keyup.enter="handleQuery" />
         </el-form-item>

         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 240px">
               <el-option v-for="item in sys_normal_disable" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
               v-hasPermi="['plcManage:tag:add']">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['plcManage:tag:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['plcManage:tag:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="handleImport"
               v-hasPermi="['plcManage:tag:import']">导入</el-button>
         </el-col>
   
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['plcManage:plc:export']">导出</el-button>
         </el-col>
         <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="tagList" :row-key="getRowKey" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" reserve-selection="true">
         </el-table-column>
         <el-table-column label="采集状态" align="center" prop="tagReadStatus">
            <template #default="scope">
               <div>
                  <el-button v-if="(scope.row.tagReadStatus == 'Y')" class="buttonMin" type="success" :icon="Check"
                     size="small" circle />
                  <el-button v-else-if="(scope.row.tagReadStatus == 'N')" class="buttonMin" type="danger" size="small"
                     circle />
                  <el-button v-else type="info" class="buttonMin" size="small" circle />
               </div>
            </template>
         </el-table-column>
         <!-- <el-table-column label="ID" align="center" prop="tagId">
         </el-table-column> -->
         <el-table-column label="点位组" align="center" prop="tagGroup"  >
         </el-table-column>
         <el-table-column label="设备代码" align="center" prop="plcCode"  >
         </el-table-column>
         <el-table-column label="点位代码" align="center" prop="tagCode"  >
         </el-table-column>
         <el-table-column label="点位名称" align="center" prop="tagName"  >
         </el-table-column>
         <el-table-column label="地址" align="center" prop="tagAddress">
         </el-table-column>
         <el-table-column label="数据类型" align="center" prop="tagDatatype">
         </el-table-column>
         <el-table-column label="采集频率" align="center" prop="tagAcquisitionFrequency">
            <template #default="scope">
               <span>{{ scope.row.tagAcquisitionFrequency + ' ms' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="读写权限" align="center" prop="tagReadWrite">
            <template #default="scope">
               <dict-tag :options="sys_read_write" :value="scope.row.tagReadWrite" />
            </template>
         </el-table-column>

         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" fixed="right">
            <template #default="scope">
               <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['plcManage:tag:edit']">修改</el-button>
               <el-button type="text" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['plcManage:tag:remove']">删除</el-button>
               <el-button type="text" @click="handleGraphic(scope.row)"
                  v-hasPermi="['data:plcData:multipleLine']">图形属性</el-button>
            </template>
         </el-table-column>
      </el-table>


      <!-- 添加或修改对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="tagRef" :model="form" :rules="rules" label-width="120px">
            <el-row>

               <el-form-item label="点位组" prop="tagGroup">
                  <el-select v-model="form.tagGroup" placeholder="请选择点位组" @change="plcCodeChange">
                     <el-option v-for="item in sys_tag_group" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                  </el-select>
               </el-form-item>

               <el-button type="text" icon="Add" @click="handleAddTagGroup"
                  v-hasPermi="['plcManage:tag:addGroup']">新增点位组</el-button>
            </el-row>
            <el-row>
               <el-form-item label="设备名称" prop="plcCode">
                  <el-select v-model="form.plcCode" placeholder="请选择设备" @change="plcCodeChange">
                     <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                        :value="item"></el-option>
                  </el-select>
               </el-form-item>

               <el-form-item label="点位代码" prop="tagCode">
                  <el-input v-model="form.tagCode" placeholder="请输入代码" :disabled="tagCodeIsDisabled"
                     @input="tagCodeInput" />
               </el-form-item>
            </el-row>
            <el-row>
               <el-form-item label="数据类型" prop="tagDatatype">
                  <el-select v-model="form.tagDatatype" placeholder="请选择类型" @change="tagDatatypeChange">
                     <el-option v-for="item in sys_tag_datatype" :key="item.value" :label="item.label" :value="item.value">
                        <span style="float: left">{{ item.label }}</span>
                        <span style=" float: right; color: var(--el-text-color-secondary); font-size: 10px; ">{{
                           item.descprtion
                        }} </span>
                     </el-option>
                  </el-select>
               </el-form-item>

               <el-form-item label="点位名称" prop="tagName">
                  <el-input v-model="form.tagName" placeholder="请输入名称" />
               </el-form-item>
            </el-row>
            <el-row>
               <el-col :span="11">
                  <el-form-item label="地址" prop="tagAddress">
                     <el-input v-model="form.tagAddress" placeholder="请输入地址" />
                  </el-form-item>

               </el-col>
               <el-col :span="12">
                  <el-form-item label="采集频率(ms)" prop="tagAcquisitionFrequency">
                     <el-input-number v-model="form.tagAcquisitionFrequency" :min="10" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-form-item label="读写权限" prop="tagReadWrite">
                  <el-radio-group v-model="form.tagReadWrite">
                     <el-radio v-for="item in sys_read_write" :key="item.value" :label="item.value">{{ item.label
                     }}</el-radio>
                  </el-radio-group>
               </el-form-item>
               <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status">
                     <el-radio v-for="item in sys_normal_disable" :key="item.value" :label="item.value">{{ item.label
                     }}</el-radio>
                  </el-radio-group>
               </el-form-item>
            </el-row>

            <el-form-item label="多点线展示" prop="tagMultipleGraphic">
               <el-radio-group v-model="form.tagMultipleGraphic">
                  <el-radio v-for="item in sys_yes_no" :key="item.value" :label="item.value">{{ item.label
                  }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 添加或修改对话框 图形属性-->
      <el-dialog :title="title" v-model="openGraphic" width="780px" append-to-body>
         <el-form ref="graphicRef" :model="formGraphic" :rules="rules" label-width="120px">
            <el-row>
               <el-form-item label="图形类型" prop="tagPlotlyType">
                  <el-select v-model="formGraphic.tagPlotlyType" placeholder="请选择图形类型">
                     <el-option label="分散点线" value="scatter" key="scatter"></el-option>
                     <el-option label="条形" value="bar" key="bar"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item label="图形模型" prop="tagPlotlyMode">
                  <el-select v-model="formGraphic.tagPlotlyMode" placeholder="请选择图形模型">
                     <el-option label="点线" value="lines+markers" key="lines+markers"></el-option>
                     <el-option label="点" value="markers" key="markers"></el-option>
                     <el-option label="线" value="lines" key="lines"></el-option>
                  </el-select>
               </el-form-item>

            </el-row>
            <el-row>
               <el-form-item label="线条颜色" prop="tagLineColor">
                  <el-select v-model="formGraphic.tagLineColor" placeholder="请选择">
                     <el-option label="蓝色" value="blue" key="blue"></el-option>
                     <el-option label="天蓝色" value="skyblue" key="skyblue"></el-option>
                     <el-option label="绿色" value="green" key="green"></el-option>
                     <el-option label="橙色" value="orange" key="orange"></el-option>
                     <el-option label="黄色" value="yellow" key="yellow"></el-option>
                  </el-select>
               </el-form-item>

               <el-form-item label="线条宽度" prop="tagLineWidth">
                  <el-input-number v-model="formGraphic.tagLineWidth" :min="2" />
               </el-form-item>
            </el-row>
            <el-row>

               <el-form-item label="线条形状" prop="tagLineDash">
                  <el-select v-model="formGraphic.tagLineDash" placeholder="请选择">
                     <el-option label="连续线" value="Solid" key="Solid"></el-option>
                     <el-option label="点线" value="dot" key="dot"></el-option>
                     <el-option label="长短线" value="dashdot" key="dashdot"></el-option>
                  </el-select>
               </el-form-item>
               <el-form-item label="线条转折方向" prop="tagLineShape">
                  <el-select v-model="formGraphic.tagLineShape" placeholder="请选择">
                     <el-option label="spline" value="spline" key="spline"></el-option>
                     <el-option label="linear" value="linear" key="linear"></el-option>
                     <el-option label="vhv" value="vhv" key="vhv"></el-option>
                     <el-option label="hvh" value="hvh" key="hvh"></el-option>
                     <el-option label="vh" value="vh" key="vh"></el-option>
                     <el-option label="hv" value="hv" key="hv"></el-option>
                  </el-select>
               </el-form-item>
            </el-row>
            <el-row>
               <el-form-item label="标记颜色" prop="tagMarkerColor">
                  <el-select v-model="formGraphic.tagMarkerColor" placeholder="请选择">
                     <el-option label="蓝色" value="blue" key="blue"></el-option>
                     <el-option label="天蓝色" value="skyblue" key="skyblue"></el-option>
                     <el-option label="绿色" value="green" key="green"></el-option>
                     <el-option label="橙色" value="orange" key="orange"></el-option>
                     <el-option label="黄色" value="yellow" key="yellow"></el-option>
                     <el-option label="黑色" value="black" key="black"></el-option>
                     <el-option label="红色" value="red" key="red"></el-option>
                  </el-select>
               </el-form-item>

               <el-form-item label="标记大小" prop="tagMarkerSize">
                  <el-input-number v-model="formGraphic.tagMarkerSize" :min="5" />
               </el-form-item>
            </el-row>

            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>


      <!-- 导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>

         <el-form ref="uploadForm" :model="upload" :rules="rules" label-width="125px">
            <el-form-item label="设备名称" prop="plcCode" :rules="rules.plcCode">
               <el-select v-model="upload.plcCode" placeholder="请选择设备" clearable>
                  <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                     :value="item.plcCode"></el-option>
               </el-select>
            </el-form-item>
         </el-form>

         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '/' + upload.plcCode +'/' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :on-error="handleUploadError"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTempDown">下载模板</el-link>
               </div>
            </template>
         </el-upload>
 

         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>




      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
         @pagination="getList" />

   </div>
</template>
<style scoped>  .buttonMin {
     width: 15px;
     height: 15px;
  }
</style >
<script setup name="Tag">
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import {
   listTag, getTag, delTag, addTag, updateTag, optionselectPlc, getTagGraphic, saveTagGraphic
   
} from "@/api/plcManage/tag";
import { getToken } from "@/utils/auth.js";
import { addData } from "@/api/system/dict/data";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
const { sys_yes_no } = proxy.useDict("sys_yes_no");

const { sys_read_write } = proxy.useDict("sys_read_write");
const sys_tag_group = ref([]);
const sys_tag_datatype = ref([]);

const optionNull = ref({ value: [] });

const isZsNumberValidate = inject('isZsNumberValidate');

const tagList = ref([]);
const open = ref(false);
const openGraphic = ref(false);
const actionAdd = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const tagIdGraphic = ref(Number);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const plcOptions = ref([]);
const tagCodeIsDisabled = ref(false);

const data = reactive({
   form: {},
   formGraphic: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      tagName: undefined,
      tagCode: undefined,
      status: undefined
   },
   rules: {
      tagGroup: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagName: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagDatatype: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagAddress: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagAcquisitionFrequency: [{ required: true, message: "不能为空", trigger: "blur" },
      { type: 'number', required: true, validator: isZsNumberValidate, trigger: "blur" }],
      tagPlotlyType: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagPlotlyMode: [{ required: true, message: "不能为空", trigger: "blur" }],
   },
});
/*** 导入参数 */
const upload = reactive({
   // 是否显示弹出层（用户导入）
   open: false,
   // 弹出层标题（用户导入）
   title: "",
   // 
   plcCode: '',
   // 是否禁用上传
   isUploading: false,
   // 是否更新已经存在的用户数据
   updateSupport: 0,
   // 设置上传的请求头部
   headers: { Authorization: "Bearer " + getToken() },
   // 上传的地址
   url: import.meta.env.VITE_APP_BASE_API + '/tag/import'
});
const { queryParams, form, rules, formGraphic } = toRefs(data);

// 保存选中的数据id,row-key就是要指定一个key标识这一行的数据
function getRowKey(row) {
   return row.tagId
}
/** 查询TAG类型列表 */
function getList() {
   loading.value = true;
   listTag(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      tagList.value = response.data;
      total.value = response.total;
      loading.value = false;
   });
}
/** 取消按钮 */
function cancel() {
   openGraphic.value = false;
   open.value = false;
   reset();
}
/** 表单重置 */
function reset() {
   form.value = {
      tagId: undefined,
      tagName: undefined,
      tagCode: undefined,
      status: "0",
      tagReadWrite: "0",
      tagMultipleGraphic: 'N',
      tagAcquisitionFrequency: 100,
      remark: undefined
   };
   proxy.resetForm("tagRef");
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
/** 新增按钮操作 */
function handleAdd() {
   reset();
   open.value = true;
   title.value = "添加点位";
   actionAdd.value = true;
   tagCodeIsDisabled.value = false;

}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.tagId);
   single.value = selection.length != 1;
   multiple.value = !selection.length;
}
/** 修改按钮操作 */
function handleUpdate(row) {
   reset();
   const tagId = row.tagId || ids.value;
   getTag(tagId).then(response => {
      form.value = response.data || {};
      open.value = true;
      title.value = "修改点位";
      actionAdd.value = false;
      tagCodeIsDisabled.value = true;

      var plc = plcOptions.value.filter(p => p.plcCode == form.value.plcCode)[0];
      plcCodeChange(plc);
   });
}
/** 提交按钮 */
function submitForm(row) {
   if (open.value) {
      proxy.$refs["tagRef"].validate(valid => {
         if (valid) {
            if (form.value.tagId != undefined) {
               updateTag(form.value).then(response => {
                  proxy.$modal.msgSuccess("修改成功");
                  open.value = false;
                  getList();
               });
            } else {
               form.value.plcCode = form.value.plcCode.plcCode;
               addTag(form.value).then(response => {
                  proxy.$modal.msgSuccess("新增成功");
                  open.value = false;
                  getList();
               });
            }
         }
      });
   }
   if (openGraphic.value) {
      proxy.$refs["graphicRef"].validate(valid => {
         if (valid) {
            formGraphic.value.tagId = tagIdGraphic.value;
            saveTagGraphic(formGraphic.value).then(response => {
               proxy.$modal.msgSuccess("保存成功");
               openGraphic.value = false;
               getList();
            });
         }
      });
   }
}
/** 删除按钮操作 */
function handleDelete(row) {
   const tagIds = row.tagId || ids.value;
   proxy.$modal.confirm('是否确认删除点位编号为"' + tagIds + '"的数据项？').then(function () {
      return delTag(tagIds);
   }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
   }).catch(() => { });
}

function handleGraphic(row) {
   tagIdGraphic.value = row.tagId || ids.value;
   getTagGraphic(tagIdGraphic.value).then(response => {
      formGraphic.value = response.data || {};
      openGraphic.value = true;
      title.value = "修改图形属性";
   });
}
/** 导出按钮操作 */
function handleExport() {
   proxy.download("tag/export", {
      ...queryParams.value
   }, `tag_${new Date().getTime()}.xls`);
}
/** 查询PLC列表 */
function getPlcList() {
   optionselectPlc().then(response => {
      plcOptions.value = response.data;
   });
}

/** plc选择 */
async function plcCodeChange(value) {
   await getTagDataTypeList(value.plcAcquisitionDriver);
}

/** 数据点位数据类型选择 */
async function tagDatatypeChange(value) {

}

function tagCodeInput(value) {
   form.value.tagName = value;
}

/** 查询设备驱动的点位数据类型列表 */
async function getTagDataTypeList(driver) {
   if (driver) {
      // let datatype = "sys_tag_datatype_" + driver;
      let datatype = "sys_tag_datatype";
      var list = await proxy.useDictDynamics(datatype);
      sys_tag_datatype.value = list[datatype].value;
   }
   else {
      sys_tag_datatype.value = toRefs(optionNull.value);
   }
}
/** 查询点位数据组列表 */
async function getTagGroupList() {
   let datatype = "sys_tag_group";
   var list = await proxy.useDictDynamics(datatype);
   sys_tag_group.value = list[datatype].value;
}

//#region  导入操作
/** 导入按钮操作 */
function handleImport() {
   upload.title = "点位导入";

   upload.open = true;
}
/** 下载模板操作 */
function importTempDown() { 
   var url = '/tag/importTempDown';
   proxy.download(url, {
    ...queryParams.value }, `tag_temp${new Date().getTime()}.xls`);
}
// 文件上传中处理
function handleFileUploadProgress(event, file, fileList) {
   upload.isUploading = true;
}
// 文件上传成功处理
function handleFileSuccess(response, file, fileList) {
   upload.isUploading = false;
   proxy.$refs["uploadRef"].handleRemove(file);
   var msg = response.msg;
   if (response.code == '200') {
      msg = response.msg;
      getList();
      upload.open = false;
   }
   proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
}
function handleUploadError(err) {
   proxy.$modal.msgError("上传文件失败");
   upload.isUploading = false; 
}
// 提交上传文件
function submitFileForm() {
   proxy.$refs["uploadForm"].validate(valid => {
      if (valid) {
         proxy.$refs["uploadRef"].submit();
      }
   });
}
//#endregion  


/**  */

//新增组名
const handleAddTagGroup = () => {
   ElMessageBox.prompt('点位数据组', '新增', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /^.+$/,
      inputErrorMessage: '请输入组名',
   })
      .then(({ value }) => {
         addData({ dictType: "sys_tag_group", dictValue: value, dictLabel: value, listClass: "info", dictSort: 1 }).then(async response => {
            await getTagGroupList();
            form.value.tagGroup = value;
            ElMessage({
               type: 'success',
               message: `新增点位数据组:${value}`,
            })
         });
      })
      .catch(() => {
         ElMessage({
            type: 'info',
            message: '新增点位数据组失败！',
         })
      })
}

const timeFlush = reactive({
   rangeFlush: 1000,//定义定时器间隔时间 
})
const state = reactive({
   timeInter: null,//定义定时器
})


//**  */
//组件挂载的过程
onMounted(async () => {
   /// 定时采集数据显示
   state.timeInter = setInterval(() => {
      console.log(queryParams.value.pageNum);
      listTag(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
         var tagstat = response.data.map(item => ({ tagId: item.tagId, tagReadStatus: item.tagReadStatus }));

         tagList.value.forEach(element => {
            element.tagReadStatus = tagstat.filter(p => p.tagId == element.tagId)[0].tagReadStatus;
         });
         total.value = response.total;
      });
   }, timeFlush.rangeFlush);
})

//组件卸载时的生命周期
onUnmounted(() => {
   if (state.timeInter) {
      clearInterval(state.timeInter) //销毁
      state.timeInter = null
   }
})


getPlcList();
getTagGroupList();
getList();
</script>
 