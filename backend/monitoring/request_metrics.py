import time
from collections import deque
from threading import Lock


class RequestMetrics:
    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        self.requests = deque()
        self.lock = Lock()

    def record(self, status_code: int, elapsed_ms: float) -> None:
        now = time.time()

        with self.lock:
            self.requests.append({
                "time": now,
                "status_code": status_code,
                "elapsed_ms": elapsed_ms,
            })

            self._remove_old_requests(now)

    def _remove_old_requests(self, now: float) -> None:
        cutoff = now - self.window_seconds

        while self.requests and self.requests[0]["time"] < cutoff:
            self.requests.popleft()

    def snapshot(self) -> dict:
        now = time.time()

        with self.lock:
            self._remove_old_requests(now)
            requests = list(self.requests)

        total = len(requests)
        failed = sum(
            1 for request in requests
            if request["status_code"] >= 400
        )

        average_latency = (
            sum(request["elapsed_ms"] for request in requests) / total
            if total else 0.0
        )

        return {
            "request_rate": total,
            "avg_response_time_ms": round(average_latency, 2),
            "error_rate": round(failed / total * 100, 2) if total else 0.0,
            "total_requests": total,
            "failed_requests": failed,
        }


request_metrics = RequestMetrics()
