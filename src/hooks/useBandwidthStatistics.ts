import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export function useBandwidthStatistics() {
    const bandwidthData = ref<Array<[Array<[number]>]>([[]]);

    const bandwidthChartRef = ref<HTMLElement | null>(null); // current bandwidth - bar chart
    let chart: echarts.ECharts | null = null;

    onMounted(async () => {

    });

    // for bar chart
    const displayData = () => {

    };

    onMounted(() => {

    });

    return { bandwidthChartRef };
}