FROM curlimages/curl:8.8.0

USER root
WORKDIR /monitor

COPY --chmod=755 monitor.sh /monitor/monitor.sh

ENTRYPOINT ["/monitor/monitor.sh"]
