import os

from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
cors = CORS()
default_async_mode = os.getenv("SOCKETIO_ASYNC_MODE", "eventlet")
default_transports = os.getenv("SOCKETIO_TRANSPORTS", "websocket").split(",")
socketio = SocketIO(cors_allowed_origins="*", async_mode=default_async_mode, transports=default_transports)
