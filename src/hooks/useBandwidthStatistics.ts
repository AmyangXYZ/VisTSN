import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { createWebSocketConnection } from './useWebSocket';

export function useBandwidthStatistics() {
    const bandwidthData = ref<Array<{ [key: string]: { bandwidth: number } }>>([]);

    const bandwidthChartRef = ref<HTMLElement | null>(null); // current bandwidth - bar chart
    let chart: echarts.ECharts | null = null;

    const socket = ref<WebSocket | null>(null);

    onMounted(() => {
        socket.value = createWebSocketConnection('ws://localhost:4399', handleDataReceived);
    });

    const handleDataReceived = (jsonData: any) => {
        bandwidthData.value.push(jsonData['bandwidth']);
        displayData();
    }

    // for bar chart
    const displayData = () => {
        const currentData = bandwidthData.value[bandwidthData.value.length - 1];

        const xAxisData: string[] = [];
        const yAxisData: number[] = [];

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
        };

        if (chart) {
            chart.setOption(options);
        } else {
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
