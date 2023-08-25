import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { createWebSocketConnection } from './useWebSocket';

export function useDelayStatistics() {
    const delayData = ref<Array<[number, number, number]>>([]);

    const delayChartRef = ref<HTMLElement | null>(null); // historical delay status - line chart
    let chart: echarts.ECharts | null = null;

    onMounted(() => {
        createWebSocketConnection('ws://localhost:4399', handleDataReceived);
    });

    const handleDataReceived = (jsonData: any) => {
        delayData.value = delayData.value.concat(jsonData['delay'].map((item: any) => [item.id, item.delay, item.jitter]));
        displayData();
    }

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
                text: 'Delay',
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
                data: delayData.value.map((_item, index) => `t${index}`),
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
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: [0],
                    filterMode: 'filter',
                    startValue: (delayData.value.length / 8) - 9, // want to show ~ 8 data points
                    endValue: (delayData.value.length / 8) - 1,
                    show: false
                }
            ]
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
