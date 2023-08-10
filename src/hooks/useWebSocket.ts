export function createWebSocketConnection(url: string, onDataReceived: any) {
    const socket = new WebSocket(url);

    socket.onopen = () => {
        console.log('WebSocket connection established.');
    };

    socket.onmessage = (event: any) => {
        // Parse the WebSocket message data
        const jsonData = JSON.parse(event.data);
        
        onDataReceived(jsonData);
    }
    socket.onerror = (error: any) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    return socket;
}