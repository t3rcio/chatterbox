
FROM python:3.11
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y supervisor && apt-get install nano -y
RUN mkdir -p /var/log/supervisor
RUN mkdir _logs

WORKDIR /code
COPY backend/ /code/
RUN pip install -r requirements.txt

COPY ./deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]


