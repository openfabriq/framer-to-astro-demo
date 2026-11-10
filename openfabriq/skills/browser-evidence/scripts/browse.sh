#!/bin/sh
# One browser check in one command: starts the app, waits until its address answers, runs the
# agent-browser steps on it, then closes the browser and stops the app. On Linux each command of an
# agent's shell has a sandbox of its own, which stops what the command started when it ends.
#   sh browse.sh "<command that starts the app>" <address> "<step>" ["<step>" ...]
#   sh browse.sh "pnpm preview --port 4321" http://localhost:4321/ "open http://localhost:4321/" "screenshot --full evidence/1/home.png"
# agent-browser finds the headless Chrome in its own settings (~/.agent-browser/config.json, or the
# engine's Docker image); its socket goes in the temporary folder, where the sandbox lets it write.
set -u
if [ $# -lt 3 ]; then
	echo 'usage: sh browse.sh "<command that starts the app>" <address> "<step>" ["<step>" ...]' >&2
	exit 2
fi
start=$1
address=$2
shift 2
tmp=${TMPDIR:-/tmp}
export AGENT_BROWSER_SOCKET_DIR="$tmp/agent-browser"
log="$tmp/app.log"

# The app in a process group of its own, so that stopping it stops what it started.
set -m
sh -c "$start" >"$log" 2>&1 &
app=$!
set +m
stop() {
	agent-browser close >/dev/null 2>&1
	kill -- "-$app" 2>/dev/null || kill "$app" 2>/dev/null
}
trap stop EXIT

if ! curl -s -o /dev/null --retry 60 --retry-connrefused --retry-delay 1 "$address"; then
	echo "The app does not answer at $address. The end of its log:" >&2
	tail -n 20 "$log" >&2
	exit 1
fi
# agent-browser does not create a screenshot's folder.
for step in "$@"; do
	case $step in
	screenshot*/*) mkdir -p "$(dirname "${step##* }")" ;;
	esac
done
agent-browser batch "$@"
