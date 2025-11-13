import time
import logging


logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Middleware to log request method, path, and time taken in ms."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000.0
        logger.info("%s %s %.2fms", request.method, request.get_full_path(), duration_ms)
        return response
