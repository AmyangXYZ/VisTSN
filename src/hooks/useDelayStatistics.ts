import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export function useDelayStatistics() {
    const delayData = ref<Array<[number, number, number]>>([]);

    const delayChartRef = ref<HTMLElement | null>(null); // historical delay status - line chart
    let chart: echarts.ECharts | null = null;

    const socket = ref<WebSocket | null>(null);

    onMounted(() => {
        // Open the WebSocket connection
        socket.value = new WebSocket('ws://localhost:4399');

        socket.value.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.value.onmessage = (event: any) => {
            // Parse the WebSocket message data
            const jsonData = JSON.parse(event.data)['delay'];

            // Reset delayData on every message received from the WebSocket
            delayData.value = delayData.value.concat(jsonData.map((item: any) => [item.id, item.delay, item.jitter]));

            // Call displayData to update the chart
            displayData();
        };

        socket.value.onerror = (error: any) => {
            console.error('WebSocket error:', error);
        };

        socket.value.onclose = () => {
            console.log('WebSocket connection closed');
        };
    });

    // for line chart - may need watch()
    const displayData = () => {
        const seriesData: echarts.EChartOption.Series[] = [];

        // Get unique id values from delayData
        const uniqueIds = Array.from(new Set(delayData.value.map(([idValue]: any[]) => idValue)));

        // Group data by id
        const groupedData: { [id: number]: number[] } = {};
        delayData.value.forEach(([idValue, delay]: any[]) => {
            if (!groupedData[idValue]) {
                groupedData[idValue] = [];
            }
            groupedData[idValue].push(delay);
        });

        // Prepare x-axis data and seriesData for each id
        uniqueIds.forEach((id: any) => {
            const idName = `ID ${id}`;
            const yAxisData = groupedData[id] || [];
            seriesData.push({
                name: idName,
                type: 'line',
                data: yAxisData,
                smooth: true,
            });
        });

        const options: echarts.EChartsOption = {
            title: {
                text: 'Historical Delay',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            grid: {
                top: 80,
                bottom: 30,
                left: '20%',
            },
            xAxis: {
                type: 'category',
                data: uniqueIds.map((id) => `t${id}`),
                axisLabel: {
                    formatter: '{value}',
                },
                axisTick: {
                    alignWithLabel: true,
                },
            },
            yAxis: {
                type: 'value',
            },
            series: seriesData,
            
        };

        if (chart) {
            chart.setOption(options);
        } else {
            chart = echarts.init(delayChartRef.value!);
            chart.setOption(options);
        }
    };

    onMounted(() => {
        chart = echarts.init(delayChartRef.value!);

        window.addEventListener('resize', () => {
            chart.resize();
        });
    });

    return { delayChartRef };
}
