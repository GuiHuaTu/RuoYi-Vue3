import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = [];
      const dicts = useDictStore().getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue,descprtion: p.remark, elTagType: p.listClass, elTagClass: p.cssClass }))
          useDictStore().setDict(dictType, res.value[dictType]);
        })
      }
    })
    return toRefs(res.value);
  })()
}
/**
 * 动态实时获取字典数据
 */
export async function useDictDynamics(dictType) {
  const res = ref({});
  res.value[dictType] = [];
  await getDicts(dictType).then(resp => {
    res.value[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, descprtion: p.remark,elTagType: p.listClass, elTagClass: p.cssClass }))
    useDictStore().setDict(dictType, res.value[dictType]);
  })
  return toRefs(res.value);

}
