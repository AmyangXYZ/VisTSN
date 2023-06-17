import {State} from './useState.ts'
import * as echarts from 'echarts'

export function useTopology() {
  const draw = function (chartDom: any) {
    const chart = echarts.init(chartDom)
    const option:any = {}
    chart.setOption(option)
  }
  return { draw }
}
