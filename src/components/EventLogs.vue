<script setup lang="ts">
  import { useLog } from '@/hooks/useLog';

  const { logData, logContainer, getMsgSubstring, getTimeSubstring } = useLog();

</script>

<template>
  <el-card>
    Logs 
    <!-- <img height="24" src="@/assets/zhiyin-fast.gif"/> -->
    <div class="chart" ref="logContainer">
      <div v-for="line in logData" :key="line" class="log-line">
        <span class="log-time">{{ getTimeSubstring(line) }}</span>
        <span class="log-msg">{{ getMsgSubstring(line) }}</span>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 330px;
  overflow-y: auto;
}

.log-line {
  font-family: monospace;
}

.log-time {
  color: green;
}

.log-msg {
  font-weight: 600;
}
</style>
