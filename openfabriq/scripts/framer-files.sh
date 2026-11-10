#!/bin/sh
# Downloads every file of Framer's CDN that the exported CMS points to, into framer-export/assets/ in the
# run's checkout. Those files stop answering once the Framer site is gone: the migration keeps its own copy.
# Needs no token: the files are public, and a maintainer exports the CMS by hand (see the README).
#
# Reads:  migration/framer-cms/*  the CSV of each collection (Framer's CMS Export plugin), and the
#                                 galleries the agents read on the published pages
# Needs:  curl, grep, sort
# Writes: framer-export/assets/<path>       each file, by its URL's path, without the URL's query
#         framer-export/assets-missing.txt  the files that did not download, one URL per line
#
# FRAMER_CDN changes the files' address (an extended regular expression): the test points it to a fake CDN.
set -euf # -f: a URL is never a glob

cdn="${FRAMER_CDN:-https://framerusercontent\.com/}"
cms=migration/framer-cms
out=framer-export

[ -d "$cms" ] || {
	echo "$cms/ is missing: export each collection with Framer's CMS Export plugin and commit the CSV files there." >&2
	exit 1
}
rm -rf "$out"
mkdir -p "$out/assets"
: >"$out/assets-missing.txt"

# A URL ends at a quote, a space, a bracket or a comma: the CSV quotes its cells and doubles the
# quotes of the HTML in rich text. The query (a size, a format) is dropped: the original is saved.
urls=$(grep -rhoE "$cdn[^\"' ()<>,]+" "$cms" | sed 's/[?#].*//' | sort -u || true)

count=0
for url in $urls; do
	path=${url#*://*/}
	case "/$path/" in */../* | //) continue ;; esac
	count=$((count + 1))
	curl -sSf --retry 5 --create-dirs -o "$out/assets/$path" "$url" || echo "$url" >>"$out/assets-missing.txt"
done

echo "Downloaded $count files into $out/assets/; $(wc -l <"$out/assets-missing.txt" | tr -d ' ') files missing."
