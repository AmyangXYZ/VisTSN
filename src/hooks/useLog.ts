import { ref, onMounted, watch } from 'vue';
import { createWebSocketConnection } from './useWebSocket';

export function useLog() {
    const logData = ref<string[]>([]);
    const logContainer = ref<HTMLElement | null>(null);

    onMounted(() => {
        createWebSocketConnection('ws://localhost:4399', handleDataReceived);
        watch(logData, () => scrollToBottom());
    });

    const handleDataReceived = (jsonData: any) => {
        logData.value.push(jsonData['log']);
        scrollToBottom();
    }

    function scrollToBottom() {
        if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
    }

    return { logData, logContainer, scrollToBottom };
}