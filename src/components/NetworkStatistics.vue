<script setup lang="ts">
  import { useBandwidthStatistics } from '@/hooks/useBandwidthStatistics';
  import { useDelayStatistics } from '@/hooks/useDelayStatistics';

  const { bandwidthChartRef } = useBandwidthStatistics();
  const { delayChartRef } = useDelayStatistics();
</script>

<template>
  <el-card>
    Statistics
    <!-- <img height="24" src="@/assets/zhiyin-fast.gif"/> -->
    <div class="chart" ref="delayChartRef"></div>
    <div class="chart" ref="bandwidthChartRef"></div>
  </el-card>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 165px;
}
</style>
