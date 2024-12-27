
FROM python:3.11
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y supervisor && apt-get install nano -y
RUN mkdir -p /var/log/supervisor

WORKDIR /code
RUN mkdir -p /code/_logs

COPY backend/ /code/
RUN pip install -r requirements.txt

COPY ./deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN python manage.py migrate

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]


