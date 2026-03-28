FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip install flask grpcio grpcio-tools

EXPOSE 5001 50052

CMD ["sh", "-c", "python -m naloge.grpc.task_server & python -m naloge.main"]