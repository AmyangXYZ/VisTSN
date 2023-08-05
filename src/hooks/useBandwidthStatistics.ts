import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useBandwidthStatistics() {
    const bandwidthData = ref<Array<[Array<[number]>]>([[]]);

    const bandwidthChartRef = ref<HTMLElement | null>(null); // current bandwidth - bar chart
    let chart: echarts.ECharts | null = null;

    onMounted(async () => {
        // load link json files
        try {

        }
        catch (error: any) {
            console.error('Error fetching data:', error);
        }
    });

    // for bar chart
    const displayData = () => {
        
        const options: echarts.EChartsOption = {
            title: {
                text: 'Bandwidth'
            },
        }
        
        if (chart) {
            chart.setOption(options);
        }
        else {
            chart = echarts.init(bandwidthChartRef.value!);
            chart.setOption(options);
        }
    };

    watch(bandwidthData, () => {
        displayData();
    });

    onMounted(() => {
        chart = echarts.init(bandwidthChartRef.value!);

        window.addEventListener('resize', () => {
            chart.resize();
        });
    });

    return { bandwidthChartRef };
}