#!/usr/bin/env bash
set -euo pipefail

HOST="${1:?usage: smoke-test-frontend-ingress-legacy.sh <host> [path]}"
PATH_TO_TEST="${2:-/}"

INGRESS_NS="${INGRESS_NS:-ingress-nginx}"
INGRESS_SVC="${INGRESS_SVC:-ingress-nginx-controller}"
INGRESS_PF_PORT="${INGRESS_PF_PORT:-18080}"

kubectl -n "${INGRESS_NS}" port-forward "svc/${INGRESS_SVC}" "${INGRESS_PF_PORT}:80" >/tmp/ingress-pf.log 2>&1 &
PF_PID=$!
trap 'kill $PF_PID >/dev/null 2>&1 || true' EXIT INT TERM

i=1
while [ $i -le 30 ]; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${INGRESS_PF_PORT}/" || true)"
  [ "$code" != "000" ] && break
  sleep 1
  i=$((i+1))
done

code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${INGRESS_PF_PORT}/" || true)"
if [ "$code" = "000" ]; then
  echo "ERROR: ingress port-forward not reachable"
  echo "--- /tmp/ingress-pf.log ---"
  tail -n 120 /tmp/ingress-pf.log || true
  exit 1
fi

curl -sS -i -H "Host: ${HOST}" "http://127.0.0.1:${INGRESS_PF_PORT}${PATH_TO_TEST}" | head -n 30