#!/bin/sh

# A hook script to verify that we don't commit files that could contain sensible data or credentials like json, csv, xls(x) or .env

sensible_files_pattern="\.(csv|xls|xls(x?)|json|env)$"
exception="(package.json|custom-environment-variables.json|example.json"
exception="$exception|manifest.json|settings.json|zapatosconfig.json|package-lock.json|coverage-final.json|extensions.json|terminals.json"
exception="$exception|DECA_Extraction MIA-Fake.csv"
exception="$exception|docker-bake.json|eslintrc.json|app.json|tsconfig.json|.mocharc.json"
exception="$exception|launch.json|biome.json|tsconfig.prod.json"
exception="$exception)$|cypress/(.*).json|ui/app/i18n/locales/.*\.json$"

# grep exits 1 when nothing matches and 2 on error (e.g. a regex this grep rejects):
# an error must block the commit, otherwise the empty list lets every file through.
fail_on_grep_error() {
  if [ "$1" -gt 1 ]; then
    echo
    echo "ERROR: could not check staged files for sensible data (grep exit code $1)."
    echo
    exit 1
  fi
}

staged=$(git diff --cached --name-only) || exit 1
candidates=$(printf '%s\n' "$staged" | grep -v -E "$exception")
fail_on_grep_error $?
files=$(printf '%s\n' "$candidates" | grep -E "$sensible_files_pattern")
fail_on_grep_error $?
if [ -z "$files" ]; then
  exit 0
fi

echo
echo "ERROR: Preventing commit of potentially sensible files:"
echo
echo "$files" | sed "s/^/   /"
echo
echo "Either reset those files, add them to .gitignore or remove them."
echo
echo "If you know what you are doing, please double-check that you are not commiting"
echo "any credentials, password or sensible data and run git commit again with --no-verify."
echo
exit 1
