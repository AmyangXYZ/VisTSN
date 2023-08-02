<script setup lang="ts">
  import { useDrawGCL } from '@/hooks/useDrawGCL'

  const { linkData, priorityData, chartRef } = useDrawGCL()
</script>

<template>
  <el-card>
    <h4>Schedule</h4>
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
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
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
    flex: 1;
    text-align: center;
  }
</style>
