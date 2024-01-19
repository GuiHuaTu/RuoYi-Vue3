import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
 
  const env = loadEnv(mode, process.cwd())
  const envAll = loadEnv(mode, process.cwd(),'') 
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.scada.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.scada.vip/admin/，则设置 baseUrl 为 /admin/。
    base: envAll.VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: createVitePlugins(envAll, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 相关配置
    server: {    
      host: '0.0.0.0', 
      open: true,
      // port: 8012, 
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        [envAll.VITE_APP_BASE_API]: {
          target: envAll.VITE_APP_BASE_Backend_Url , 
          // target: 'https://127.0.0.1:7062',//本地测试
          // target: 'https://192.168.36.195:5000',//Linux服务器
          // target: 'https://192.168.0.101:5000',//天津铁厂192.168.0.101服务器

          ws: true,        //如果要代理 websockets，配置这个参数
          changeOrigin: true,  //是否跨域
          secure: false,  // 如果是https接口，需要配置这个参数
          rewrite: (p) => p.replace(/^\/api/, '') //重写url，注意一定要和请求名一致
        }
         
      }
    },
    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  }
})
