<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="PLC名称" prop="plcCode">
            <el-select v-model="queryParams.plcCode" placeholder="请选择PLC设备" clearable @keyup.enter="handleQuery">
               <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                  :value="item.plcCode"></el-option>
            </el-select>
         </el-form-item>
         <el-form-item label="点位代码" prop="tagCode" v-show="false">
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
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['plcManage:plc:export']">导出</el-button>
         </el-col>
         <!-- <el-col :span="1.5">
            <el-button type="info" plain icon="Upload"  @click="handleImport"
               v-hasPermi="['plcManage:tag:import']">
               导入
            </el-button>
         </el-col> -->
         <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="tagList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center">
         </el-table-column>
         <el-table-column label="ID" align="center" prop="tagId">
         </el-table-column>
         <el-table-column label="设备代码" align="center" prop="plcCode" :show-overflow-tooltip="true">
         </el-table-column>
         <el-table-column label="点位代码" align="center" prop="tagCode" :show-overflow-tooltip="true">
         </el-table-column>
         <el-table-column label="点位名称" align="center" prop="tagName" :show-overflow-tooltip="true">
         </el-table-column>
         <el-table-column label="地址" align="center" prop="tagAddress">
         </el-table-column>
         <el-table-column label="数据类型" align="center" prop="tagDatatype">
         </el-table-column>
         <el-table-column label="采集频率(ms)" align="center" prop="tagAcquisitionFrequency">
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
            </template>
         </el-table-column>
      </el-table>


      <!-- 添加或修改对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="tagRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-form-item label="设备名称" prop="plcCode">
                  <el-select v-model="form.plcCode" placeholder="请选择设备" @change="plcCodeChange">
                     <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                        :value="item"></el-option>
                  </el-select>
               </el-form-item>

               <el-form-item label="点位代码" prop="tagCode">
                  <el-input v-model="form.tagCode" placeholder="请输入代码" :disabled="tagCodeIsDisabled" />
               </el-form-item>
            </el-row>
            <el-row>
               <el-form-item label="数据类型" prop="tagDatatype">
                  <el-select v-model="form.tagDatatype" placeholder="请选择类型" @change="changeSelectDataType($event)">
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
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body
         :before-close="handleClose">

         <el-form ref="uploadForm" :model="upload" :rules="rules" label-width="125px">
            <el-form-item label="设备名称" prop="plcCode" :rules="rules.plcCode">
               <el-select v-model="upload.plcCode" placeholder="请选择设备" clearable>
                  <el-option v-for="item in plcOptions" :key="item.plcCode" :label="item.plcName"
                     :value="item.plcCode"></el-option>
               </el-select>
            </el-form-item>
         </el-form>

         <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
            :action="upload.url + '/' + upload.updateSupport + '/' + upload.plcCode" :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :on-error="handleUploadError"
            @*:auto-upload="false" *@ drag>

            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
               <span>仅允许导入xls、xlsx格式文件。</span>
               <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                  @click="importTemplate">下载模板</el-link>
            </div>
         </el-upload>
         <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitFileForm">确 定</el-button>
            <el-button @click="upload.open = false">取 消</el-button>
         </div>
      </el-dialog>


      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
         @pagination="getList" />

   </div>
</template>

<script setup name="Tag">
import { listTag, getTag, delTag, addTag, updateTag, optionselectPlc } from "@/api/plcManage/tag";
import { getToken } from "@/utils/auth.js";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
const { sys_read_write } = proxy.useDict("sys_read_write");
const sys_tag_datatype = ref([]);

const isZsNumberValidate = inject('isZsNumberValidate');

const tagList = ref([]);
const open = ref(false);
const actionAdd = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const plcOptions = ref([]);
const tagCodeIsDisabled = ref(false);

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      tagName: undefined,
      tagCode: undefined,
      status: undefined
   },
   rules: {
      tagName: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagDatatype: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagAddress: [{ required: true, message: "不能为空", trigger: "blur" }],
      tagAcquisitionFrequency: [{ required: true, message: "不能为空", trigger: "blur" },
      { type: 'number', required: true, validator: isZsNumberValidate, trigger: "blur" }],
   },
   // 导入参数
   upload: {
      // 是否显示弹出层（导入）
      open: false,
      // 弹出层标题（导入）
      title: "",
      // 是否禁用上传
      isUploading: false,
      // 是否更新已经存在的数据
      updateSupport: 0,
      //设备ID
      equipId: undefined,
      // 设置上传的请求头部
      headers: { Authorization: "Bearer " + getToken() },
      // 上传的地址
      url: "/tag/Import"
   },
});

const { queryParams, form, rules, upload } = toRefs(data);
 
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
      form.value = response.data;
      open.value = true;
      title.value = "修改点位";
      actionAdd.value = false;
      tagCodeIsDisabled.value = true;

      var plc = plcOptions.value.filter(p => p.plcCode == form.value.plcCode)[0];
      plcCodeChange(plc);
   });
}
/** 提交按钮 */
function submitForm() {
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

/** 查询设备驱动的点位数据类型列表 */
async function getTagDataTypeList(driver) {
   if (driver) {
      let datatype = "sys_tag_datatype_" + driver;
      var list = await proxy.useDictDynamics(datatype);
      sys_tag_datatype.value = list[datatype].value;
   }
   else {
      sys_tag_datatype = ref([]);
   }
}




getPlcList();
getList();
</script>
 