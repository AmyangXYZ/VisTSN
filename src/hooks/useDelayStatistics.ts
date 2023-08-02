import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export function useDelayStatistics() {
    const delayData = ref<Array<[number, number, number]>>([]);
    
    const delayChartRef = ref<HTMLElement | null>(null); // historical delay status - line chart
    let chart: echarts.ECharts | null = null;

    onMounted(async () => {

    });

    // for line chart - may need watch()
    const displayData = () => {

    };

    onMounted(() => {

    });

    return { delayChartRef };
}