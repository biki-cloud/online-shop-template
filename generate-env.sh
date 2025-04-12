#!/bin/bash

ENV=$1

ENV_FILE=".env.${ENV}.tmpl"
COMMON_FILE=".env.common"
OUTPUT_FILE=".env.${ENV}"

# $ENVがlocal, dev, prd, githubactionsのいずれかでなければエラー終了
if [ "$ENV" != "local" ] && [ "$ENV" != "dev" ] && [ "$ENV" != "prd" ] && [ "$ENV" != "githubactions" ]; then
  echo "Usage: $0 <env>" >&2
  echo "<env> must be one of local, dev, prd, githubactions." >&2
  exit 1
fi

# 引数がなければエラー終了
if [ -z "$1" ]; then
  echo "Usage: $0 <env>" >&2
  exit 1
fi

# 入力ファイル存在チェック
if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE が見つかりません。" >&2
  exit 1
fi

if [ ! -f "$COMMON_FILE" ]; then
  echo "$COMMON_FILE が見つかりません。" >&2
  exit 1
fi

# 一時ファイルで生成
TMP_FILE=$(mktemp)

while IFS= read -r line; do
  if [ "$line" = "###COMMON_ENV###" ]; then
    cat "$COMMON_FILE" >> "$TMP_FILE"
  else
    echo "$line" >> "$TMP_FILE"
  fi
done < "$ENV_FILE"

mv "$TMP_FILE" "$OUTPUT_FILE"
echo "$OUTPUT_FILE を生成しました。"
