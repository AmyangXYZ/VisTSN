import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useBandwidthStatistics() {
    const bandwidthData = ref<Array<{ [key: string]: { bandwidth: number } }>>([]);
    let currentDataIndex = 0;

    const bandwidthChartRef = ref<HTMLElement | null>(null); // current bandwidth - bar chart
    let chart: echarts.ECharts | null = null;

    onMounted(async () => {
        // load link json files
        try {
            for (let i = 0; i < 5; i++) {
                const response = await fetch(`../../example/json_format/status/link_t${i}.json`);
                const jsonData = await response.json();
                bandwidthData.value.push(jsonData);
            }
            displayData();
            // cycle through data every second
            setInterval(() => {
                currentDataIndex = (currentDataIndex + 1) % bandwidthData.value.length;
                displayData();
            }, 1000);
        }
        catch (error: any) {
            console.error('Error fetching data:', error);
        }
    });

    // for bar chart
    const displayData = () => {
        const currentData = bandwidthData.value[currentDataIndex];

        const xAxisData: string[] = [];
        const yAxisData: string[] = [];

        for (const key in currentData) {
            xAxisData.push(key);
            yAxisData.push(currentData[key].bandwidth);
        }

        const options: echarts.EChartsOption = {
            title: {
                text: 'Bandwidth'
            },
            grid: {
                left: '20%'
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisLabel: {
                    interval: 0,
                    rotate: 60,
                    fontSize: 5
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    type: 'bar',
                    data: yAxisData
                }
            ]
        }
        
        if (chart) {
            chart.setOption(options);
        }
        else {
            chart = echarts.init(bandwidthChartRef.value!);
            chart.setOption(options);
        }
    };

    onMounted(() => {
        chart = echarts.init(bandwidthChartRef.value!);

        window.addEventListener('resize', () => {
            chart.resize();
        });
    });

    return { bandwidthChartRef };
}