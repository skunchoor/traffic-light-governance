import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Any, Set
import logging

logger = logging.getLogger("sse_manager")


class SSEManager:
    """
    Server-Sent Events (SSE) Manager for streaming real-time updates to connected React dashboard clients.
    Works smoothly across serverless/async environments.
    """
    def __init__(self):
        self._clients: Set[asyncio.Queue] = set()

    async def connect(self) -> asyncio.Queue:
        queue = asyncio.Queue(maxsize=100)
        self._clients.add(queue)
        logger.info(f"Client connected to SSE stream. Total connected: {len(self._clients)}")
        return queue

    def disconnect(self, queue: asyncio.Queue):
        if queue in self._clients:
            self._clients.remove(queue)
            logger.info(f"Client disconnected from SSE stream. Total connected: {len(self._clients)}")

    async def broadcast(self, event_type: str, payload: Dict[str, Any]):
        """
        Push structured JSON event to all connected queues.
        """
        if not self._clients:
            return

        event_data = {
            "event_type": event_type,
            "payload": payload,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Format as SSE string: data: <json>\n\n
        sse_message = f"event: {event_type}\ndata: {json.dumps(event_data, default=str)}\n\n"

        to_remove = []
        for queue in list(self._clients):
            try:
                # Put with short timeout/non-blocking
                if queue.full():
                    try:
                        queue.get_nowait()  # Drop oldest if queue is full
                    except asyncio.QueueEmpty:
                        pass
                await queue.put(sse_message)
            except Exception as e:
                logger.error(f"Error broadcasting to client queue: {e}")
                to_remove.append(queue)

        for q in to_remove:
            self.disconnect(q)


sse_manager = SSEManager()
