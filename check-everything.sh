#!/bin/bash

# Create errors folder if it doesn't exist
mkdir -p ../RME_admin/errors

# Archive directory for the current run
ARCHIVE_DIR="../RME_admin/errors_archive/$(date +"%Y-%m-%d_%H-%M-%S")"
mkdir -p "$ARCHIVE_DIR"
mkdir -p ../RME_admin/errors_archive
ln -sfn "$ARCHIVE_DIR" ../RME_admin/errors_archive/latest

# -----------------------------------------------------------------------------
# NEW: Create a minimal file list for the core project files
# Only include files in core directories and key config files at the project root.
# Adjust the below paths as needed.
{
  find ./src -type f
  find ./public -type f 2>/dev/null
  find . -maxdepth 1 -type f \( -name "package.json" \
    -o -name "README.md" \
    -o -name "tsconfig.json" \
    -o -name "next.config.js" \
    -o -name "tailwind.config.js" \
    -o -name ".env.example" \)
} | grep -v "RME_admin" | sort -u > "$ARCHIVE_DIR/file_list.txt"
# -----------------------------------------------------------------------------

# Logging function
log() {
    local msg="[ $(date +"%Y-%m-%d %H:%M:%S") ] $1"
    echo "$msg"
    echo "$msg" >> "$ARCHIVE_DIR/run.log"
}

log "Starting dependency and error checks..."

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Initialize dependency errors file
> ../RME_admin/errors/dependency-errors.txt

# Check for required tools
if ! command -v madge &> /dev/null; then
    echo "Madge not installed. Run: npm install -g madge" >> ../RME_admin/errors/dependency-errors.txt
fi

if ! command -v pydeps &> /dev/null; then
    echo "pydeps not installed. Run: pip install pydeps" >> ../RME_admin/errors/dependency-errors.txt
fi

if ! command -v eslint &> /dev/null; then
    echo "ESLint not installed. Run: npm install -g eslint" >> ../RME_admin/errors/dependency-errors.txt
fi

if ! command -v pylint &> /dev/null; then
    echo "Pylint not installed. Run: pip install pylint" >> ../RME_admin/errors/dependency-errors.txt
fi

if ! command -v mypy &> /dev/null; then
    echo "Mypy not installed. Run: pip install mypy" >> ../RME_admin/errors/dependency-errors.txt
fi

# Count unique dependency issues
dependency_issues=$(sort -u ../RME_admin/errors/dependency-errors.txt | wc -l)

# 1. Generate a Dependency Graph (JS/TS)
run_madge() {
    if command_exists madge; then
        log "Generating JS/TS dependency graph..."
        madge --image "../RME_admin/errors/dependency-graph.png" src
    else
        echo "Madge not installed. Run: npm install -g madge" > "../RME_admin/errors/dependency-errors.txt"
    fi
}

# 2. Find All References of a Given File
run_grep() {
    read -p "Enter filename to search for references (e.g., CompanyList.tsx): " filename
    grep -r "$filename" ./src > ../RME_admin/errors/file-references.txt
    log "File references saved to ../RME_admin/errors/file-references.txt"
}

# 3. Find Unused Imports in TypeScript
run_tsc_unused_imports() {
    if command_exists tsc; then
        log "Checking for unused imports..."
        tsc --noEmit --strict > ../RME_admin/errors/ts-unused-imports.txt 2>&1
        log "Unused imports saved to ../RME_admin/errors/ts-unused-imports.txt"
    else
        log "TypeScript not installed. Run: npm install -g typescript" | tee -a ../RME_admin/errors/dependency-errors.txt
    fi
}

# 4. Python Dependency Analysis
run_pydeps() {
    if command_exists pydeps; then
        log "Analyzing Python dependencies..."
        find . -name "*.py" | while read -r pyfile; do
            pydeps "$pyfile" --noshow > "../RME_admin/errors/python-dependency-$(basename "$pyfile" .py).txt" 2>/dev/null
        done
        log "Python dependency analysis saved in ../RME_admin/errors/"
    else
        echo "pydeps not installed. Run: pip install pydeps" >> ../RME_admin/errors/dependency-errors.txt
    fi
}

# 5. Check for Build Errors
run_build_check() {
    if [ -f "package.json" ]; then
        log "Checking for build errors..."
        npm run build > ../RME_admin/errors/build-errors.txt 2>&1
        log "Build errors saved to ../RME_admin/errors/build-errors.txt"
    fi
}

# 6. Check for Type Errors
run_tsc_type_errors() {
    if command_exists tsc; then
        log "Checking for TypeScript errors..."
        tsc > ../RME_admin/errors/ts-type-errors.txt 2>&1
        log "Type errors saved to ../RME_admin/errors/ts-type-errors.txt"
    fi
}

# 7. Run ESLint for Linting Issues
run_eslint() {
    if command_exists eslint; then
        log "Running ESLint..."
        eslint "src/" --ext .js,.ts,.tsx > ../RME_admin/errors/eslint-errors.txt 2>&1
        log "Linting issues saved to ../RME_admin/errors/eslint-errors.txt"
    else
        echo "ESLint not installed. Run: npm install -g eslint" >> ../RME_admin/errors/dependency-errors.txt
    fi
}

# 8. Check for Runtime Errors (Node.js Projects)
run_runtime_errors() {
    if [ -f "package.json" ] && [ -f "src/index.js" ]; then
        log "Running Node.js application to check runtime errors..."
        node src/index.js > ../RME_admin/errors/runtime-errors.txt 2>&1
        log "Runtime errors saved to ../RME_admin/errors/runtime-errors.txt"
    fi
}

# 9. Python Linting (Pylint)
run_pylint() {
    if command_exists pylint; then
        log "Running Pylint..."
        pylint $(find . -name "*.py") > ../RME_admin/errors/pylint-errors.txt 2>&1
        log "Python linting errors saved to ../RME_admin/errors/pylint-errors.txt"
    else
        echo "Pylint not installed. Run: pip install pylint" >> ../RME_admin/errors/dependency-errors.txt
    fi
}

# 10. Python Type Checking (Mypy)
run_mypy() {
    if command_exists mypy; then
        log "Running Mypy for type checking..."
        mypy . > ../RME_admin/errors/mypy-errors.txt 2>&1
        log "Python type errors saved to ../RME_admin/errors/mypy-errors.txt"
    else
        echo "Mypy not installed. Run: pip install mypy" >> ../RME_admin/errors/dependency-errors.txt
    fi
}

# Function to print comparison stats
print_comparison() {
    local name="$1"
    local prev="${2:-0}"
    local curr="${3:-0}"

    # Handle empty or invalid numbers
    prev=${prev//[!0-9]/}
    curr=${curr//[!0-9]/}
    prev=${prev:-0}
    curr=${curr:-0}

    local resolved=0
    if [ "$prev" -gt "$curr" ]; then
        resolved=$((prev - curr))
    fi

    local new=0
    if [ "$curr" -gt "$prev" ]; then
        new=$((curr - prev))
    fi

    printf "%-20s Previous: %3d | Fixed: %3d | New: %3d | Current: %3d\n" \
        "$name:" "$prev" "$resolved" "$new" "$curr"
}

# Function to get error count from summary file
get_error_count() {
    local file="$1"
    local error_type="$2"
    
    # First try to get count from summary section
    local count=$(grep -a "^$error_type: " "$file" 2>/dev/null | head -n1 | awk '{print $NF}')
    
    # If not found or not a number, try comparison section
    if ! [[ "$count" =~ ^[0-9]+$ ]]; then
        count=$(grep -a "^$error_type:" "$file" 2>/dev/null | grep "Current:" | awk '{print $NF}')
    fi
    
    # If still not a valid number, return 0
    if ! [[ "$count" =~ ^[0-9]+$ ]]; then
        count=0
    fi
    
    echo "$count"
}

# Generate error summary
generate_error_summary() {
    local prev_dir="$1"
    local current_dir="$2"
    
    # Get counts for each error type
    local prev_build=$(get_error_count "$prev_dir/summary.txt" "Build errors")
    local curr_build=$(get_error_count "$current_dir/summary.txt" "Build errors")
    local prev_deps=$(get_error_count "$prev_dir/summary.txt" "Dependency issues")
    local curr_deps=$(get_error_count "$current_dir/summary.txt" "Dependency issues")
    local prev_eslint=$(get_error_count "$prev_dir/summary.txt" "ESLint errors")
    local curr_eslint=$(get_error_count "$current_dir/summary.txt" "ESLint errors")
    local prev_ts=$(get_error_count "$prev_dir/summary.txt" "TypeScript errors")
    local curr_ts=$(get_error_count "$current_dir/summary.txt" "TypeScript errors")
    local prev_imports=$(get_error_count "$prev_dir/summary.txt" "Unused imports")
    local curr_imports=$(get_error_count "$current_dir/summary.txt" "Unused imports")
    
    # Calculate totals
    local prev_total=$((prev_build + prev_deps + prev_eslint + prev_ts + prev_imports))
    local curr_total=$((curr_build + curr_deps + curr_eslint + curr_ts + curr_imports))
    
    { # Start of a new code block for output redirection
        echo ""
        echo "Error Comparison with Previous Run"
        echo "================================="
        print_comparison "Build errors" "$prev_build" "$curr_build"
        print_comparison "Dependency issues" "$prev_deps" "$curr_deps"
        print_comparison "ESLint errors" "$prev_eslint" "$curr_eslint"
        print_comparison "TypeScript errors" "$prev_ts" "$curr_ts"
        print_comparison "Unused imports" "$prev_imports" "$curr_imports"
        echo "--------------------------------"
        print_comparison "Total errors" "$prev_total" "$curr_total"
    } >> "$current_dir/summary.txt" # End of the code block, redirecting output
}

# Function to analyze file changes between runs
analyze_file_changes() {
    local prev_dir="$1"
    local current_dir="$2"
    
    if [ ! -f "$prev_dir/file_list.txt" ] || [ ! -f "$current_dir/file_list.txt" ]; then
        echo "File tracking information not available for comparison"
        return
    fi
    
    # Find new files
    comm -13 <(sort "$prev_dir/file_list.txt") <(sort "$current_dir/file_list.txt") > "$current_dir/new_files.txt"
    
    # Find deleted files
    comm -23 <(sort "$prev_dir/file_list.txt") <(sort "$current_dir/file_list.txt") > "$current_dir/deleted_files.txt"
    
    # Count changes
    local new_count=$(wc -l < "$current_dir/new_files.txt")
    local deleted_count=$(wc -l < "$current_dir/deleted_files.txt")
    
    {
        echo ""
        echo "File Changes"
        echo "============"
        echo "New files: $new_count"
        echo "Deleted files: $deleted_count"
        
        if [ "$new_count" -gt 0 ]; then
            echo ""
            echo "New Files:"
            echo "---------"
            cat "$current_dir/new_files.txt"
        fi
        
        if [ "$deleted_count" -gt 0 ]; then
            echo ""
            echo "Deleted Files:"
            echo "-------------"
            cat "$current_dir/deleted_files.txt"
        fi
    } >> "$current_dir/summary.txt"
}

# Run checks in parallel to speed up execution
run_madge &
run_grep &
run_tsc_unused_imports &
run_pydeps &
run_build_check &
run_tsc_type_errors &
run_eslint &
run_runtime_errors &
run_pylint &
run_mypy &

# Wait for all background processes to complete
wait

# First, copy current errors to archive
log "Archiving results..."
mkdir -p "$ARCHIVE_DIR"
cp -v ../RME_admin/errors/* "$ARCHIVE_DIR" 2>&1 | tee -a "$ARCHIVE_DIR/copy.log"

# Generate basic summary
{
    echo "Error Summary - $(date)"
    echo "========================="
    
    # Build errors
    build_errors=$(grep -a -E "Error:|error TS[0-9]+:|warning TS[0-9]+:" "$ARCHIVE_DIR/build-errors.txt" | wc -l)
    echo "Build errors: $build_errors"
    
    # Count dependencies by section
    missing_deps=$(awk '/^Missing dependencies/{flag=1;next}/^$/{flag=0}flag' "$ARCHIVE_DIR/dependency-errors.txt" | grep -a "^\* " | sort -u | wc -l)
    unused_deps=$(awk '/^Unused dependencies/{flag=1;next}/^[A-Z]/{flag=0}flag' "$ARCHIVE_DIR/dependency-errors.txt" | grep -a "^\* " | sort -u | wc -l)
    unused_dev_deps=$(awk '/^Unused devDependencies/{flag=1;next}/^[A-Z]/{flag=0}flag' "$ARCHIVE_DIR/dependency-errors.txt" | grep -a "^\* " | sort -u | wc -l)
    install_issues=$(grep -a "not installed\." "$ARCHIVE_DIR/dependency-errors.txt" | sort -u | wc -l)
    
    dependency_issues=$((missing_deps + unused_deps + unused_dev_deps + install_issues))
    echo "Dependency issues: $dependency_issues"
    
    # ESLint errors
    eslint_errors=$(grep -a -E "error[[:space:]]+[A-Za-z-]+/|warning[[:space:]]+[A-Za-z-]+/" "$ARCHIVE_DIR/eslint-errors.txt" | sort -u | wc -l)
    echo "ESLint errors: $eslint_errors"
    
    # TypeScript errors
    ts_errors=$(grep -a -E "error TS[0-9]+:" "$ARCHIVE_DIR/ts-type-errors.txt" | sort -u | wc -l)
    echo "TypeScript errors: $ts_errors"
    
    # Unused imports
    unused_imports=$(grep -a -E "'.*' is declared but its value is never used" "$ARCHIVE_DIR/ts-unused-imports.txt" | sort -u | wc -l)
    echo "Unused imports: $unused_imports"
    
    # Total errors
    total_errors=$((build_errors + dependency_issues + eslint_errors + ts_errors + unused_imports))
    echo "Total errors: $total_errors"

    echo ""
    echo "Top Build Errors:"
    grep -a -E "Error:|error TS[0-9]+:|warning TS[0-9]+:" "$ARCHIVE_DIR/build-errors.txt" | \
        sed 's/.*Error: //' | \
        sort | uniq -c | sort -nr | head -n 5
    
    echo ""
    echo "Dependency Issues Breakdown:"
    echo "- Missing Dependencies: $missing_deps"
    echo "- Unused Dependencies: $((unused_deps + unused_dev_deps))"
    echo "- Installation Issues: $install_issues"
} > "$ARCHIVE_DIR/summary.txt"

# Add a note about RME_admin location
echo "Note: Additional development resources are stored in ../RME_admin/" >> "$ARCHIVE_DIR/summary.txt"

# Get previous run by sorting directory names lexicographically
PREV_RUN=$(find ../RME_admin/errors_archive -maxdepth 1 -type d -name "20*" | sort -r | sed -n '2p')

if [ -z "$PREV_RUN" ]; then
    log "No previous run found - comparison skipped"
else
    # Ensure we have the full path
    PREV_RUN=$(realpath "$PREV_RUN")
    CURR_RUN=$(realpath "$ARCHIVE_DIR")
    
    log "Generating error comparison with $(basename "$PREV_RUN")..."
    generate_error_summary "$PREV_RUN" "$CURR_RUN"
    
    log "Analyzing file changes..."
    analyze_file_changes "$PREV_RUN" "$CURR_RUN"
fi

log "All checks completed! Results are saved in: $ARCHIVE_DIR"
log "Summary file location: $ARCHIVE_DIR/summary.txt"

# After archiving results, create/update the "latest" symlink
current_archive="../RME_admin/errors_archive/$(date +"%Y-%m-%d_%H-%M-%S")"

# Remove existing symlink if it exists
rm -f ../RME_admin/errors_archive/latest

# Create new symlink
ln -sf "$current_archive" ../RME_admin/errors_archive/latest