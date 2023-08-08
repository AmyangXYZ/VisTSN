import { ref, onMounted } from 'vue';

export function useLog() {
    const logData = ref<string[]>([]);

    const socket = ref<WebSocket | null>(null);

    onMounted(async () => {
        try {
            // Open the WebSocket connection
            socket.value = new WebSocket('ws://localhost:4399');

            socket.value.onopen = () => {
                console.log('WebSocket connection established.');
            };

            socket.value.onmessage = (event: any) => {
                // Parse the WebSocket message data
                const jsonData = JSON.parse(event.data)['log'];

                logData.value.push(jsonData);
            };

            socket.value.onerror = (error: any) => {
                console.error('WebSocket error:', error);
            };

            socket.value.onclose = () => {
                console.log('WebSocket connection closed');
            };
        } 
        catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    return { logData };
}