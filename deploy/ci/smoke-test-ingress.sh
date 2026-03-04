#!/usr/bin/env bash
set -euo pipefail

HOST="${1:?usage: smoke-test-ingress.sh <host> [path]}"
PATH_TO_TEST="${2:-/health}"

# Optional: pass target namespace for better debug output
TARGET_NS="${TARGET_NS:-}"

INGRESS_NS="${INGRESS_NS:-ingress-nginx}"
INGRESS_SVC="${INGRESS_SVC:-ingress-nginx-controller}"
LOCAL_PORT="${LOCAL_PORT:-18080}"

LOG_FILE="${LOG_FILE:-/tmp/ingress-pf.log}"

echo "Smoke test via ingress port-forward:"
echo "  INGRESS_NS=$INGRESS_NS"
echo "  INGRESS_SVC=$INGRESS_SVC"
echo "  LOCAL_PORT=$LOCAL_PORT"
echo "  HOST=$HOST"
echo "  PATH=$PATH_TO_TEST"
if [ -n "$TARGET_NS" ]; then
  echo "  TARGET_NS=$TARGET_NS"
fi

# Start port-forward
kubectl -n "$INGRESS_NS" port-forward "svc/$INGRESS_SVC" "${LOCAL_PORT}:80" >"$LOG_FILE" 2>&1 &
PF_PID=$!
trap 'kill $PF_PID >/dev/null 2>&1 || true' EXIT INT TERM

# Wait until port-forward socket is reachable (NOT success routing; just avoid "connection refused")
i=1
while [ $i -le 30 ]; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${LOCAL_PORT}/" || true)"
  if [ "$code" != "000" ]; then
    break
  fi
  sleep 1
  i=$((i+1))
done

code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${LOCAL_PORT}/" || true)"
if [ "$code" = "000" ]; then
  echo "ERROR: ingress port-forward not reachable on 127.0.0.1:${LOCAL_PORT}"
  echo "--- $LOG_FILE (tail) ---"
  tail -n 120 "$LOG_FILE" || true
  exit 1
fi

URL="http://127.0.0.1:${LOCAL_PORT}${PATH_TO_TEST}"

echo "==> Request: $URL (Host: $HOST)"
# IMPORTANT: do NOT use -f here; we want to see headers/body even on 404
http_code="$(curl -sS -i -H "Host: $HOST" "$URL" -o /tmp/ingress-smoke.out -w "%{http_code}")"

# Print first lines like your old script (helpful for debugging)
head -n 30 /tmp/ingress-smoke.out || true

# Fail if not 2xx/3xx (treat 404 etc as failure)
if ! echo "$http_code" | grep -Eq '^(2|3)[0-9]{2}$'; then
  echo "ERROR: ingress smoke test failed (HTTP $http_code)"
  echo "--- $LOG_FILE (tail) ---"
  tail -n 120 "$LOG_FILE" || true

  # Extra debug (optional, but very useful in CI)
  if [ -n "$TARGET_NS" ]; then
    echo "--- kubectl -n $TARGET_NS get ingress -o wide ---"
    kubectl -n "$TARGET_NS" get ingress -o wide || true
    echo "--- kubectl -n $TARGET_NS get ingress -o yaml (head) ---"
    kubectl -n "$TARGET_NS" get ingress -o yaml | head -n 160 || true
  else
    echo "--- kubectl get ingress -A -o wide ---"
    kubectl get ingress -A -o wide || true
  fi

  exit 1
fi

echo "OK: ingress smoke test passed (HTTP $http_code)"