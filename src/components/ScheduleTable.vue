<script setup lang="ts">
  import { useGCLData } from '@/hooks/useGCLData'
  import { ref, onMounted } from 'vue'
  import * as echarts from 'echarts'

  const { gclData, linkData, priorityData } = useGCLData()
  const chartRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    // initialize chart
    const chart = echarts.init(chartRef.value!)

    // prep data for chart
    const data = gclData.value.map((item: any) => {
      return [item[1], item[2] - item[1]]
    })

    // set up chart options
    const options: echarts.EChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'value',
        name: 'Time',
        max: 10000,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'category',
        data: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
      },
      series: [
        {
          type: 'bar',
          data: data,
          itemStyle: {
            color: function (params: any) {
              // set color based on data interval
              return params.data[1] > 0 ? 'orange' : 'white'
            },
          },
        },
      ],
    }

    // render the chart
    chart.setOption(options)

    // resize the chart with change in window size
    window.addEventListener('resize', () => {
      chart.resize()
    })
  })

</script>

<template>
  <el-card>
    <div class="main-section">
      <div class="chart" ref="chartRef"></div>
    </div>
    <div class="bottom-section">
      <div class="bottom-left">
        <h4>Link ID:</h4>
        <p>{{ linkData }}</p>
      </div>
      <div class="bottom-right">
        <h4>Priority Mapping:</h4>
        <p>{{ priorityData }}</p>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.main-section {

}
.chart {
  width: 90%;
  height: 330px;
}
.bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bottom-left, .bottom-right {

}
</style>
