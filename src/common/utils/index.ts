import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

/**
 * 生成唯一id
 * UUID
 * @returns
 */
export function GenerateUUID(): string {
  const uuid = uuidv4();
  return uuid.replaceAll('-', '');
}

/**
 * 获取当前时间
 * YYYY-MM-DD HH:mm:ss
 * @returns
 */
export function GetNowDate() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}


/**
 * 数组转树结构
 * @param arr
 * @param getId
 * @param getLabel
 * @returns
 */
export function ListToTree(arr, getId, getLabel) {
  const kData = {}; // 以id做key的对象 暂时储存数据
  const lData: any[] = []; // 最终的数据 arr

  // 第一次遍历，构建 kData
  arr.forEach((m) => {
    const id = getId(m);
    const label = getLabel(m);
    const parentId = +m.parentId;

    kData[id] = {
      id,
      label,
      parentId,
      children: [], // 初始化 children 数组
    };

    // 如果是根节点，直接推入 lData
    if (parentId === 0) {
      lData.push(kData[id]);
    }
  });
  // 第二次遍历，处理子节点
  arr.forEach((m) => {
    const id = getId(m);
    const parentId = +m.parentId;

    if (parentId !== 0) {
      // 确保父节点存在后再添加子节点
      if (kData[parentId]) {
        kData[parentId].children.push(kData[id]);
      } else {
        console.warn(`Parent menuId: ${parentId} not found for child menuId: ${id}`);
      }
    }
  });
  return lData;
}

/**
 * 数组去重
 * @param arr 
 * @returns 
 */
export function Uniq(arr: any[]) {
  return [...new Set(arr)];
}