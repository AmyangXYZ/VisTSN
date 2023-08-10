import { ref, onMounted } from 'vue';
import { createWebSocketConnection } from './useWebSocket';

export function useLog() {
    const logData = ref<string[]>([]);

    const socket = ref<WebSocket | null>(null);

    onMounted(async () => {
        createWebSocketConnection('ws://localhost:4399', handleDataReceived);
    });

    const handleDataReceived = (jsonData: any) => {
        logData.value.push(jsonData['log']);
    }

    return { logData };
}