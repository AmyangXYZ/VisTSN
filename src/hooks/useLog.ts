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

    const getMsgSubstring = (line: string) => {
        return line.substring(0, line.indexOf('-') - 1);
    }

    const getTimeSubstring = (line: string) => {
        return '[' + line.substring(line.indexOf('-') + 2) + '] ';
    }

    return { logData, logContainer, getTimeSubstring, getMsgSubstring };
}