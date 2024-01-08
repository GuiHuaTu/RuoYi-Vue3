import { createApp ,inject  } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/es/locale/lang/zh-cn'
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core'
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from 'echarts/charts'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict ,useDictDynamics} from '@/utils/dict'
import { parseTime, getDate,getTime,getDateTime,resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/tool'
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'

const app = createApp(App)

// 全局方法挂载 
app.config.globalProperties.inject = inject
app.config.globalProperties.useDict = useDict
app.config.globalProperties.useDictDynamics = useDictDynamics
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.getDate = getDate
app.config.globalProperties.getTime = getTime
app.config.globalProperties.getDateTime = getDateTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

const shortcuts = [
  {
      text: '1 min ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 1/60 * 1)
          return [start, end]
      },
  },
  {
      text: '5 min ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 1/12 * 1)
          return [start, end]
      },
  },
  {
      text: '15 min ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 1/4 * 1)
          return [start, end]
      },
  },
  {
      text: '1 h ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 1 * 1)
          return [start, end]
      },
  },
  {
      text: '3 h ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 3 * 1)
          return [start, end]
      },
  },
  {
      text: '6 h ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 6 * 1)
          return [start, end]
      },
  },
  {
      text: '12 h ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 12 * 1)
          return [start, end]
      },
  },
  {
      text: '24 h ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
          return [start, end]
      },
  },
  {
      text: '3 day ',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
          return [start, end]
      },
  },
  {
      text: 'Last week',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
      },
  },
  {
      text: 'Last month',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
      },
  },
  {
      text: 'Last 3 months',
      value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
      },
  }
];

const isZsNumberalidate = (rule, value, callback) => {
    if (rule.required) {
        if (value === '' || value === null || value === undefined || value < 0) {
            callback(new Error(rule.message));
        }
        else if (value < 0) {
            callback(new Error('请输入大于0的数字'));
        }
        else {
            callback()
        }
    } else {
        callback();
    }
};

const isNullValidate = (rule, value, callback) => {
    if (rule.required) {
        if (value === '' || value === null || value === undefined) {
            callback(new Error(rule.message));
        }
        else {
            callback()
        }
    } else {
        callback();
    }
};
const dateRangeValidate = (rule, value, callback) => {
    if (rule.required) {
        if (!value || value.length == 0) {
            callback(new Error(rule.message));
        }
        else {
            callback()
        }
    } else {
        callback();
    }
};

const numberValidate = (rule, value, callback) => {
    if (rule.required) {
        if (value === '') {
            callback(new Error(rule.message));
        }
        else {
            if (value <= 0) {
                callback(new Error('输入的数量应大于0'));
            }
            callback()
        }
    } else {
        callback();
    }
};

// 使用 provide 将全局变量作为响应式对象
app.provide('shortcuts', shortcuts); //便于在js部分可直接用
// 使用 globalProperties 将全局变量附加到 Vue 实例上
app.config.globalProperties.$shortcuts = shortcuts;  //便于在模板部分可直接用{{$shortcuts}} .
// import { ref, inject } from "vue";后使用 inject(shortcuts) 使用变量
 
// 使用 provide 将全局变量作为响应式对象
app.provide('numberValidate', numberValidate); //便于在js部分可直接用
// 使用 globalProperties 将全局变量附加到 Vue 实例上
app.config.globalProperties.$numberValidate = numberValidate;  //便于在模板部分可直接用{{$numberValidate}}

// 使用 provide 将全局变量作为响应式对象
app.provide('dateRangeValidate', dateRangeValidate); //便于在js部分可直接用
// 使用 globalProperties 将全局变量附加到 Vue 实例上
app.config.globalProperties.$dateRangeValidate = dateRangeValidate;  //便于在模板部分可直接用{{$dateRangeValidate}}

// 使用 provide 将全局变量作为响应式对象
app.provide('isNullValidate', isNullValidate); //便于在js部分可直接用
// 使用 globalProperties 将全局变量附加到 Vue 实例上
app.config.globalProperties.$isNullValidate = isNullValidate;  //便于在模板部分可直接用{{$isNullValidate}}


// 使用 provide 将全局变量作为响应式对象
app.provide('isZsNumberalidate', isZsNumberalidate); //便于在js部分可直接用
// 使用 globalProperties 将全局变量附加到 Vue 实例上
app.config.globalProperties.$isZsNumberalidate = isZsNumberalidate;  //便于在模板部分可直接用{{$isZsNumberalidate}}


// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
