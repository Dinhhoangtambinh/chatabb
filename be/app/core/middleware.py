from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
import time

from .logging_config import logger

class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000

            logger.info(
                f"{request.method} {request.url.path} "
                f"completed_in={process_time:.2f}ms "
                f"status={response.status_code}"
            )

            return response

        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            error_trace = traceback.format_exc()

            logger.error(
                f"Exception during {request.method} {request.url.path} "
                f"({process_time:.2f}ms): {repr(e)}\n{error_trace}"
            )

            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Internal Server Error",
                    "message": str(e),
                },
            )
