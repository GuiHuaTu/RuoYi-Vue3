<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="PLC名称" prop="plcName">
            <el-input v-model="queryParams.plcName" placeholder="请输入PLC名称" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="PLC代码" prop="plcCode">
            <el-input v-model="queryParams.plcCode" placeholder="请输入PLC代码" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item label="PLC类型" prop="plcType">
            <el-select v-model="queryParams.plcType" placeholder="PLC类型" clearable style="width: 240px">
               <el-option v-for="plc in sys_plc_type" :key="plc.value" :label="plc.label" :value="plc.value" />
            </el-select>
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="PLC状态" clearable style="width: 240px">
               <el-option v-for="plc in sys_normal_disable" :key="plc.value" :label="plc.label" :value="plc.value" />
            </el-select>
         </el-form-item>
         <!-- <el-form-item label="创建时间" style="width: 308px">
             <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item> -->
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:plc:add']">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['system:plc:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['system:plc:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['system:plc:export']">导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="PLC编号" align="center" prop="plcId" />
         <el-table-column label="PLC名称" align="center" prop="plcName" :show-overflow-tooltip="true" />
         <el-table-column label="PLC类型" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <router-link :to="'/system/plc-data/index/' + scope.row.plcId" class="link-type">
                  <span>{{ scope.row.plcType }}</span>
               </router-link>
            </template>
         </el-table-column>
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <plc-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:plc:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['system:plc:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
         @pagination="getList" />

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="plcRef" :model="form" :rules="rules" label-width="120px">

            <el-row>
               <el-form-item label="PLC名称" prop="plcName">
                  <el-input v-model="form.plcName" placeholder="请输入PLC名称" />
               </el-form-item>
               <el-form-item label="PLC代码" prop="plcCode">
                  <el-input v-model="form.plcCode" placeholder="请输入PLC代码" />
               </el-form-item>
            </el-row>

            <el-tabs type="border-card">
               <el-tab-pane label="基础属性">
                  <el-row>
                     <el-form-item label="PLC类型" prop="plcType">
                        <el-select v-model="form.plcType" placeholder="PLC类型" clearable @change="plcTypeChange">
                           <el-option v-for="plc in sys_plc_type" :key="plc.value" :label="plc.label" :value="plc.value" />
                        </el-select>
                     </el-form-item>

                     <el-form-item label="型号/协议" prop="plcModelProtocol">
                        <el-select v-model="form.plcModelProtocol" placeholder="型号/协议" clearable>
                           <el-option v-for="plc in sys_model_protocol" :key="plc.value" :label="plc.label"
                              :value="plc.value" />
                        </el-select>
                     </el-form-item>
                  </el-row>

                  <el-row>
                     <el-form-item label="网络类型" prop="plcNetworkType">
                        <el-select v-model="form.plcNetworkType" placeholder="网络类型" clearable
                           @change="plcNetworkTypeChange">
                           <el-option v-for="plc in sys_network_type" :key="plc.value" :label="plc.label"
                              :value="plc.value" />
                        </el-select>
                     </el-form-item>
                     <el-form-item label="推送频率(ms)" prop="plcSendFrequ">
                        <el-input-number v-model.number="form.plcSendFrequ" placeholder="" />
                     </el-form-item>
                  </el-row>

                  <el-form-item label="状态" prop="status">
                     <el-radio-group v-model="form.status">
                        <el-radio v-for="plc in sys_normal_disable" :key="plc.value" :label="plc.value">{{ plc.label
                        }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
                  <el-form-item label="备注" prop="remark">
                     <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                  </el-form-item>

               </el-tab-pane>
               <el-tab-pane label="连接配置">

               </el-tab-pane>
            </el-tabs>


         </el-form>

         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>
 
<script setup name="Plc">
import { listPlc, getPlc, delPlc, addPlc, updatePlc } from "@/api/plcManage/plc";
import useDictStore from '@/store/modules/dict'

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
const { sys_plc_type } = proxy.useDict("sys_plc_type");
const { sys_network_type } = proxy.useDict("sys_network_type");

const isZsNumberalidate = inject('isZsNumberalidate');

const typeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      plcName: undefined,
      plcType: undefined,
      status: undefined
   },
   rules: {
      plcName: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcCode: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcType: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcSendFrequ: [
         { required: true, message: "不能为空", validator: isZsNumberalidate, trigger: "blur" },
         { type: 'number', required: true, message: "请输入数值", trigger: "blur" }
      ],
      plcNetworkType: [{ required: true, message: "不能为空", trigger: "blur" }],
      plcModelProtocol: [{ required: true, message: "不能为空", trigger: "blur" }],
   },
});

const { queryParams, form, rules } = toRefs(data);
const sys_model_protocol = ref([]);

/** 查询PLC类型列表 */
function getList() {
   loading.value = true;
   listPlc(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      typeList.value = response.data;
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
      plcId: undefined,
      plcName: undefined,
      plcType: undefined,
      status: "0",
      remark: undefined
   };
   proxy.resetForm("plcRef");
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
   form.value.plcSendFrequ = 1000;
   open.value = true;
   title.value = "添加PLC";
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.plcId);
   single.value = selection.length != 1;
   multiple.value = !selection.length;
}
/** 修改按钮操作 */
function handleUpdate(row) {
   reset();
   const plcId = row.plcId || ids.value;
   getPlc(plcId).then(response => {
      form.value = response.data;
      open.value = true;
      title.value = "修改PLC";
   });
}
/** 提交按钮 */
function submitForm() {
   proxy.$refs["plcRef"].validate(valid => {
      if (valid) {
         if (form.value.plcId != undefined) {
            updatePlc(form.value).then(response => {
               proxy.$modal.msgSuccess("修改成功");
               open.value = false;
               getList();
            });
         } else {
            addPlc(form.value).then(response => {
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
   const plcIds = row.plcId || ids.value;
   proxy.$modal.confirm('是否确认删除PLC编号为"' + plcIds + '"的数据项？').then(function () {
      return delPlc(plcIds);
   }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
   }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport() {
   proxy.download("plc/export", {
      ...queryParams.value
   }, `plc_${new Date().getTime()}.xls`);
}


/** plc类型选择 */
function plcTypeChange(value) {
   if (value) {
      let dictTypeActive = value + "_model_protocol";
      console.log(dictTypeActive);
      var list = proxy.useDictDynamics(dictTypeActive);
      sys_model_protocol.value = list[dictTypeActive].value;
      console.log(list);
      console.log(list[dictTypeActive].value);
      console.log(sys_model_protocol.value);

   } else {
      form.value.plcModelProtocol = "";
      sys_model_protocol = ref([]);
   }
}

/** plc网络类型选择 */
function plcNetworkTypeChange(value) {
   if (value) {

   } else {

   }
}

getList();
</script>
 