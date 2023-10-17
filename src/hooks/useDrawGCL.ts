import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { createWebSocketConnection } from './useWebSocket';

export function useDrawGCL() {
    const gclData = ref<Array<[number, number, number]>>([]);
    const gclCycleMax = ref<number>(0);

    const linkData = ref<string>('');
    const priorityData = ref<string>('');

    const chartRef = ref<HTMLElement | null>(null);
    let chart: any = null;

    let links: any = ['loading links...']; // example

    let currentLinkIndex = 0;

    let cycleInterval = 0; // this is coming from the json

    onMounted(async () => {
        try {
            // createWebSocketConnection('ws://localhost:4399', handleDataReceived);

            const gResponse = await fetch('../../example/json_format/gcl.json');
            const gData = await gResponse.json(); // treat gData like jsonData['schedule'] from handleDataReceived

            gclCycleMax.value = gData['cycle'];
            delete gData['cycle'];
            
            links = Object.keys(gData);
            
            linkData.value = links[currentLinkIndex];

            cycleInterval = gData[linkData.value][0];
            gclData.value = gData[linkData.value]?.slice(1);

            displayData();
            console.log(gData);

            const pResponse = await fetch('../../example/json_format/prio2q.json');
            const pData = await pResponse.json();
            priorityData.value = pData[linkData.value]
                .map(([prio, q]: number[]) => `${prio}:${q}`)
                .join(', ');
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        setInterval(cycleLinks, 5000);
    });

    const cycleLinks = () => {
        currentLinkIndex = (currentLinkIndex + 1) % links.length; // will always be some valid index
        linkData.value = links[currentLinkIndex];
    };

    const handleDataReceived = (jsonData: any) => {
        gclCycleMax.value = jsonData['schedule']['cycle']; // e.g. 100,000
        delete jsonData['schedule']['cycle'];
        
        links = Object.keys(jsonData['schedule']);
        
        //cycleInterval = +jsonData['schedule'][linkData.value][0];
        cycleInterval = 10000;
        gclData.value = jsonData['schedule'][linkData.value].slice(1);

        displayData(); // Call displayData to update the chart
        console.log(jsonData);
    };

    const displayData = () => {
        const newGCLData = gclData.value;
        // Set up chart options
        const options: echarts.EChartsOption = {
            tooltip: {
                position: 'top'
            },
            legend: {
                show: false
            },
            grid: {
                height: '50%',
                top: '10%'
            },
            xAxis: {
                type: 'category',
                data: Array.from({ length: Math.ceil(gclCycleMax.value / cycleInterval) + 1 }, (_, i) => i * cycleInterval), // Use the start time as x-axis data
                splitArea: {
                    show: false
                },
                axisLabel: {
                    interval: 0,
                    align: 'left',
                    margin: 10,
                },
                axisTick: {
                    interval: cycleInterval
                }
            },
            yAxis: {
                type: 'category',
                data: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
                splitArea: {
                    show: true
                }
            },
            visualMap: {
                type: 'piecewise',
                min: 1,
                max: 1,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '15%',
                pieces: [
                    { min: 0 },
                ]
            },
            series: [
                {
                    name: 'Interval',
                    type: 'heatmap',
                    data: newGCLData.map(([q, start, end]: [number, number, number]) => {
                        // For each interval, directly use the start and end points
                        return [start.toString(), q, end - start];
                    }),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: false
                    },
                    itemStyle: {
                        color: 'orange',
                    }
                }
            ]
        };

        // Render the chart if it's already initialized
        if (chart) {
            chart.setOption(options);
        }
    };

    onMounted(() => {
        // Initialize chart after data is fetched and set up
        chart = echarts.init(chartRef.value!);

        // Resize the chart with change in window size
        window.addEventListener('resize', () => {
            chart.resize();
        });
    });

    return { linkData, priorityData, chartRef };
}