#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LANE="${1:-upload_app_store_connect}"
ENV_FILE="${APP_DIR}/.env.asc.local"

fail() {
  echo "Error: $*" >&2
  exit 1
}

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
  set +a
fi

[[ -n "${ASC_KEY_ID:-}" ]] || fail "ASC_KEY_ID is missing. Set it in ${ENV_FILE} or your shell."
[[ -n "${ASC_ISSUER_ID:-}" ]] || fail "ASC_ISSUER_ID is missing. Set it in ${ENV_FILE} or your shell."

if [[ -z "${ASC_KEY_CONTENT:-}" && -z "${ASC_KEY_PATH:-}" ]]; then
  fail "Provide ASC_KEY_CONTENT (base64) or ASC_KEY_PATH (.p8 path)."
fi

if [[ -n "${ASC_KEY_PATH:-}" ]]; then
  case "${ASC_KEY_PATH}" in
    "~/"*) ASC_KEY_PATH="${HOME}/${ASC_KEY_PATH#~/}" ;;
  esac

  if [[ "${ASC_KEY_PATH}" != /* ]]; then
    ASC_KEY_PATH="${APP_DIR}/${ASC_KEY_PATH}"
  fi

  [[ -f "${ASC_KEY_PATH}" ]] || fail "ASC_KEY_PATH file not found: ${ASC_KEY_PATH}"
  export ASC_KEY_PATH
fi

cd "${APP_DIR}"
npm run build:full
npm run fastlane:setup
cd ios/App
export BUNDLE_PATH="vendor/bundle"
export BUNDLE_DISABLE_SHARED_GEMS="1"
bundle exec fastlane ios "${LANE}"
