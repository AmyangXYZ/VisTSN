import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useDelayStatistics() {
    const delayData = ref<Array<[number, number, number]>>([]);

    const delayChartRef = ref<HTMLElement | null>(null); // historical delay status - line chart
    let chart: echarts.ECharts | null = null;

    const socket = ref<WebSocket | null>(null);

    onMounted(async () => {
        // load flow json files
        try {
            for (let i = 0; i < 5; i++) {
                const response = await fetch(`../../example/json_format/status/flow_t${i}.json`);
                const jsonData = await response.json();
                delayData.value = delayData.value.concat(jsonData.map((item: any) => [item.id, item.delay, item.jitter]));
            }
            displayData();
        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    });

    // for line chart - may need watch()
    const displayData = () => {
        const seriesData: echarts.EChartOption.Series[] = [];

        for (let i = 0; i < 5; i++) {
            const id = `ID ${i}`;
            const yAxisData: number[] = [];

            delayData.value.forEach(([idValue, delay, jitter]: [number, number, number]) => {
                if (idValue === i) {
                    yAxisData.push(delay);
                }
            });

            seriesData.push({
                name: id,
                type: 'line',
                data: yAxisData,
                smooth: true,
            });
        }

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
                left: '20%'
            },
            xAxis: {
                type: 'category',
                data: ['t0', 't1', 't2', 't3', 't4'],
                axisLabel: {
                    formatter: '{value}',
                },
                axisTick: {
                    alignWithLabel: true
                }
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

    watch(delayData, () => {
        displayData();
    });

    onMounted(() => {
        chart = echarts.init(delayChartRef.value!);

        window.addEventListener('resize', () => {
            chart.resize();
        });
    });

    return { delayChartRef };
}
