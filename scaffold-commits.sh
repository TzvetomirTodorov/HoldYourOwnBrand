#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# HYOW E-Commerce - Smart Scaffolding Script v1.0
# ══════════════════════════════════════════════════════════════════════════════
#
# Based on PawsTrack Smart Scaffolding Script v2.6
# Adapted for Hold Your Own Brand e-commerce platform
#
# This script analyzes WHAT changed and creates meaningful, verbose commits
# that describe the actual features and changes.
#
# Features:
# - Branch-aware: auto-detects current branch, compares/pushes correctly
# - Smart feature detection for e-commerce patterns
# - Groups files by feature for logical commits
# - Compares against remote to detect ONLY real changes
# - Safe staging area management
#
# Usage:
#   chmod +x scaffold-commits.sh
#   ./scaffold-commits.sh
#
# ══════════════════════════════════════════════════════════════════════════════

# ==================== CONFIGURATION ====================
GITHUB_USER="TzvetomirTodorov"
REPO_NAME="HoldYourOwnBrand"
GITHUB_REPO="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
DEFAULT_BRANCH="main"

# Temp directory
TEMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'scaffold')
trap "rm -rf $TEMP_DIR" EXIT

# ==================== COLORS ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
GOLD='\033[0;33m'
NC='\033[0m'

# ==================== HELPER FUNCTIONS ====================
print_header() {
    echo ""
    echo -e "${GOLD}══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GOLD}  🔥 $1${NC}"
    echo -e "${GOLD}══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }
print_file() { echo -e "  ${GRAY}→${NC} $1"; }

# ==================== SMART FEATURE DETECTION ====================
# This function looks at file names and paths to determine the ACTUAL feature
# Adapted for e-commerce patterns

detect_feature() {
    local file="$1"
    local basename=$(basename "$file")
    local dirname=$(dirname "$file")
    
    # ===== E-COMMERCE SPECIFIC FEATURES (most specific first) =====
    
    # Products
    case "$file" in
        *[Pp]roduct*|*catalog*|*inventory*)
            echo "products"
            return ;;
    esac
    
    # Orders/Checkout
    case "$file" in
        *[Oo]rder*|*[Cc]heckout*|*[Pp]ayment*)
            echo "orders"
            return ;;
    esac
    
    # Cart/Shopping
    case "$file" in
        *[Cc]art*|*[Ss]hopping*|*[Bb]asket*)
            echo "cart"
            return ;;
    esac
    
    # Categories
    case "$file" in
        *[Cc]ategor*)
            echo "categories"
            return ;;
    esac
    
    # Wishlist
    case "$file" in
        *[Ww]ishlist*|*[Ff]avorite*)
            echo "wishlist"
            return ;;
    esac
    
    # Stripe/PayPal Payment
    case "$file" in
        *[Ss]tripe*|*[Pp]aypal*|*webhook*)
            echo "payments"
            return ;;
    esac
    
    # Admin Dashboard
    case "$file" in
        */admin/*|*[Aa]dmin[A-Z]*)
            echo "admin"
            return ;;
    esac
    
    # Authentication
    case "$file" in
        *[Aa]uth[A-Z]*|*[Aa]uth.js*|*[Ll]ogin*|*[Rr]egister*|*[Vv]erify*|*[Pp]assword*|*[Ss]ession*)
            echo "auth"
            return ;;
    esac
    
    # User Management
    case "$file" in
        *[Uu]sers.jsx|*[Uu]ser[Cc]ontroller*|*[Uu]ser[Rr]outes*|*[Pp]rofile*|*[Aa]ccount*)
            echo "users"
            return ;;
    esac
    
    # Email/Notifications
    case "$file" in
        *email*|*[Nn]otification*|*resend*|*smtp*|*mailer*)
            echo "email"
            return ;;
    esac
    
    # Image Upload/Cloudinary
    case "$file" in
        *[Uu]pload*|*[Cc]loudinary*|*[Ii]mage*)
            echo "uploads"
            return ;;
    esac
    
    # ===== CATEGORY-BASED DETECTION (fallback) =====
    
    # Migrations/Seeds
    case "$file" in
        */migrations/*|*/db/seed*|*migrate*)
            echo "database"
            return ;;
    esac
    
    # Documentation
    case "$file" in
        *.md|docs/*|README*|CHANGELOG*|LICENSE*|*.txt)
            echo "docs"
            return ;;
    esac
    
    # Tests
    case "$file" in
        *.test.js|*.spec.js|*/tests/*|*/__tests__/*)
            echo "tests"
            return ;;
    esac
    
    # Styles
    case "$file" in
        *.css|*.scss|*tailwind*|*style*)
            echo "styles"
            return ;;
    esac
    
    # Configuration
    case "$file" in
        */config/*|*.config.js|*.config.ts|.env*|railway.json|docker*|Dockerfile*|vercel.json)
            echo "config"
            return ;;
    esac
    
    # Dependencies
    case "$file" in
        package.json|package-lock.json|*/package.json)
            echo "dependencies"
            return ;;
    esac
    
    # Scripts
    case "$file" in
        *.sh|scripts/*)
            echo "scripts"
            return ;;
    esac
    
    # CI/CD
    case "$file" in
        .github/*|*.yml|*.yaml)
            echo "ci-cd"
            return ;;
    esac
    
    # Assets
    case "$file" in
        */assets/*|*/images/*|*/public/*|*.svg|*.png|*.jpg)
            echo "assets"
            return ;;
    esac
    
    # API Services (client)
    case "$file" in
        */services/*.js|*/api.js)
            echo "api-client"
            return ;;
    esac
    
    # Store/State (Zustand, Redux)
    case "$file" in
        */store/*|*Store.js|*Slice.js)
            echo "state"
            return ;;
    esac
    
    # Controllers (backend)
    case "$file" in
        */controllers/*)
            echo "backend-api"
            return ;;
    esac
    
    # Routes (backend)
    case "$file" in
        */routes/*)
            echo "backend-routes"
            return ;;
    esac
    
    # Middleware
    case "$file" in
        */middleware/*)
            echo "middleware"
            return ;;
    esac
    
    # App.jsx / Main entry
    case "$file" in
        */App.jsx|*/App.tsx|*/main.jsx|*/index.jsx)
            echo "app-core"
            return ;;
    esac
    
    # Pages index
    case "$file" in
        */pages/index.js|*/pages/index.ts)
            echo "page-exports"
            return ;;
    esac
    
    # Pages (frontend)
    case "$file" in
        */pages/*.jsx|*/pages/*.tsx)
            echo "ui-pages"
            return ;;
    esac
    
    # Layout components
    case "$file" in
        */layout/*|*Layout*)
            echo "layout"
            return ;;
    esac
    
    # Components (frontend)
    case "$file" in
        */components/*.jsx|*/components/*.tsx)
            echo "ui-components"
            return ;;
    esac
    
    # Utilities
    case "$file" in
        */utils/*|*/helpers/*|*/lib/*)
            echo "utilities"
            return ;;
    esac
    
    # Default
    echo "misc"
}

# ==================== COMMIT MESSAGE GENERATION ====================
get_commit_title() {
    local feature="$1"
    case "$feature" in
        products)       echo "feat(products): update product management and catalog" ;;
        orders)         echo "feat(orders): update order processing and checkout flow" ;;
        cart)           echo "feat(cart): update shopping cart functionality" ;;
        categories)     echo "feat(categories): update product categories" ;;
        wishlist)       echo "feat(wishlist): update wishlist functionality" ;;
        payments)       echo "feat(payments): update Stripe/PayPal payment integration" ;;
        admin)          echo "feat(admin): update admin dashboard and management" ;;
        auth)           echo "feat(auth): update authentication system" ;;
        users)          echo "feat(users): update user management" ;;
        email)          echo "feat(email): update email notifications" ;;
        uploads)        echo "feat(uploads): update image upload functionality" ;;
        database)       echo "feat(db): update database schema and migrations" ;;
        backend-api)    echo "feat(api): update backend API controllers" ;;
        backend-routes) echo "feat(routes): update backend route definitions" ;;
        middleware)     echo "feat(middleware): update Express middleware" ;;
        api-client)     echo "feat(client-api): update frontend API service" ;;
        state)          echo "feat(state): update state management (stores)" ;;
        app-core)       echo "feat(core): update application core configuration" ;;
        layout)         echo "feat(layout): update layout components" ;;
        ui-pages)       echo "feat(pages): update page components" ;;
        page-exports)   echo "refactor(pages): update page exports" ;;
        ui-components)  echo "feat(components): update UI components" ;;
        utilities)      echo "refactor(utils): update utility functions" ;;
        tests)          echo "test: update test suite" ;;
        docs)           echo "docs: update documentation" ;;
        styles)         echo "style: update styling and CSS" ;;
        config)         echo "chore(config): update configuration files" ;;
        dependencies)   echo "chore(deps): update dependencies" ;;
        scripts)        echo "chore(scripts): update build/deploy scripts" ;;
        ci-cd)          echo "ci: update CI/CD pipeline" ;;
        assets)         echo "chore(assets): update static assets" ;;
        misc)           echo "chore: miscellaneous updates" ;;
        *)              echo "chore: update $feature" ;;
    esac
}

get_commit_body() {
    local feature="$1"
    case "$feature" in
        products)       echo "
Updates to product management:
- Product listing and detail views
- Inventory tracking
- Product variants (size, color)
- Featured products and catalog display" ;;
        orders)         echo "
Updates to order processing:
- Checkout flow improvements
- Order status tracking
- Payment processing integration
- Order confirmation and history" ;;
        cart)           echo "
Shopping cart updates:
- Add/remove items
- Quantity adjustments
- Cart persistence
- Price calculations" ;;
        payments)       echo "
Payment integration updates:
- Stripe checkout session
- PayPal integration
- Webhook handling
- Payment confirmation" ;;
        admin)          echo "
Admin dashboard updates:
- Dashboard statistics
- Product management
- Order management
- User management" ;;
        auth)           echo "
Authentication system updates:
- Login/registration flow
- JWT token management
- Password reset
- Session handling" ;;
        database)       echo "
Database updates:
- Schema migrations
- Seed data
- Index optimizations" ;;
        *)              echo "" ;;
    esac
}

# ==================== MAIN SCRIPT ====================
print_header "HYOW E-Commerce - Smart Scaffolding Script v1.0"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    print_error "Not a git repository!"
    print_info "Run: git init && git remote add origin $GITHUB_REPO"
    exit 1
fi

print_step "Step 1: Repository Status"

# Get current branch
WORKING_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
print_info "Current branch: $WORKING_BRANCH"

# Check for uncommitted changes
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    print_warning "You have uncommitted changes"
fi

# ==================== STEP 2: FETCH REMOTE ====================
print_step "Step 2: Sync with Remote"

FETCH_SUCCESS="no"
REMOTE_EXISTS="no"
COMPARE_BRANCH="$WORKING_BRANCH"

# Check if remote exists
if git remote | grep -q "origin"; then
    print_info "Remote 'origin' found"
    
    # Try to fetch
    if git fetch origin "$WORKING_BRANCH" 2>/dev/null; then
        FETCH_SUCCESS="yes"
        print_success "Fetched origin/$WORKING_BRANCH"
    elif git fetch origin 2>/dev/null; then
        FETCH_SUCCESS="yes"
        print_success "Fetched remote refs"
    elif git fetch origin main:refs/remotes/origin/main 2>/dev/null; then
        FETCH_SUCCESS="yes"
        COMPARE_BRANCH="main"
        print_success "Fetched origin/main (for comparison)"
    fi
else
    print_warning "No remote configured"
    print_info "Add remote: git remote add origin $GITHUB_REPO"
fi

# Determine remote ref for comparison
REMOTE_REF=""
if git rev-parse --verify "origin/$WORKING_BRANCH" >/dev/null 2>&1; then
    REMOTE_REF="origin/$WORKING_BRANCH"
    COMPARE_BRANCH="$WORKING_BRANCH"
    REMOTE_EXISTS="yes"
elif git rev-parse --verify "origin/main" >/dev/null 2>&1; then
    REMOTE_REF="origin/main"
    COMPARE_BRANCH="main"
    REMOTE_EXISTS="yes"
fi

if [ "$REMOTE_EXISTS" = "yes" ]; then
    print_success "Comparing against $REMOTE_REF"
else
    print_warning "No remote history - treating as initial commit"
fi

# ==================== STEP 3: DETECT CHANGES ====================
print_step "Step 3: Detecting Changes"

if [ "$REMOTE_EXISTS" = "yes" ]; then
    # Get all local files
    LOCAL_FILES=$(find . -type f \
        ! -path './.git/*' \
        ! -path './node_modules/*' \
        ! -path './client/node_modules/*' \
        ! -path './server/node_modules/*' \
        ! -path './client/dist/*' \
        ! -path './.vercel/*' \
        ! -name '*.log' \
        ! -name '.env' \
        ! -name '.env.local' \
        2>/dev/null | sed 's|^\./||' | sort)
    
    # Compare each file
    CHANGED_FILES=""
    for file in $LOCAL_FILES; do
        REMOTE_HASH=$(git ls-tree "$REMOTE_REF" "$file" 2>/dev/null | awk '{print $3}')
        
        if [ -z "$REMOTE_HASH" ]; then
            # New file
            CHANGED_FILES="$CHANGED_FILES$file"$'\n'
        else
            # Existing file - compare content
            LOCAL_HASH=$(git hash-object "$file" 2>/dev/null)
            if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
                CHANGED_FILES="$CHANGED_FILES$file"$'\n'
            fi
        fi
    done
    
    CHANGED_FILES=$(echo "$CHANGED_FILES" | grep -v '^$' | sort -u)
else
    # No remote - all files are new
    CHANGED_FILES=$(find . -type f \
        ! -path './.git/*' \
        ! -path './node_modules/*' \
        ! -path './client/node_modules/*' \
        ! -path './server/node_modules/*' \
        ! -path './client/dist/*' \
        ! -path './.vercel/*' \
        ! -name '*.log' \
        ! -name '.env' \
        ! -name '.env.local' \
        2>/dev/null | sed 's|^\./||' | sort)
fi

if [ -z "$CHANGED_FILES" ]; then
    print_success "Repository is up to date with remote!"
    echo ""
    read -p "Create empty commit for redeploy? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit --allow-empty -m "chore: trigger redeploy

Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
        print_success "Empty commit created"
        read -p "Push now? (y/n) " -n 1 -r
        echo ""
        [[ $REPLY =~ ^[Yy]$ ]] && git push origin "$WORKING_BRANCH"
    fi
    exit 0
fi

FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
print_info "Found ${FILE_COUNT} files changed vs remote"
echo ""

# Categorize files by feature
for file in $CHANGED_FILES; do
    feature=$(detect_feature "$file")
    echo "$file" >> "$TEMP_DIR/$feature.files"
done

FEATURES=$(ls "$TEMP_DIR"/*.files 2>/dev/null | xargs -n1 basename 2>/dev/null | sed 's/.files$//' | sort)

# Show detected features
echo -e "${WHITE}Detected Features:${NC}"
echo ""
for feature in $FEATURES; do
    file_count=$(wc -l < "$TEMP_DIR/$feature.files" | tr -d ' ')
    title=$(get_commit_title "$feature")
    echo -e "  ${GREEN}●${NC} ${CYAN}$feature${NC} ($file_count files)"
    echo -e "    ${WHITE}→ $title${NC}"
done
echo ""

# ==================== STEP 4: PREVIEW COMMITS ====================
print_step "Step 4: Commit Plan"

# Order features logically (e-commerce order)
FEATURE_ORDER="products orders cart categories wishlist payments admin auth users email uploads database backend-api backend-routes middleware api-client state app-core layout ui-pages page-exports ui-components utilities tests docs styles config dependencies scripts ci-cd assets misc"

echo -e "${WHITE}Commits to create:${NC}"
echo ""

COMMIT_NUM=0
COMMIT_ORDER=""

for feature in $FEATURE_ORDER; do
    if [ -f "$TEMP_DIR/$feature.files" ]; then
        COMMIT_NUM=$((COMMIT_NUM + 1))
        COMMIT_ORDER="$COMMIT_ORDER $feature"
        
        title=$(get_commit_title "$feature")
        file_count=$(wc -l < "$TEMP_DIR/$feature.files" | tr -d ' ')
        
        echo -e "${GREEN}$COMMIT_NUM.${NC} ${WHITE}$title${NC}"
        echo -e "   ${GRAY}$file_count files:${NC}"
        head -5 "$TEMP_DIR/$feature.files" | while read -r file; do
            echo -e "   ${GRAY}  - $file${NC}"
        done
        [ "$file_count" -gt 5 ] && echo -e "   ${GRAY}  ... and $((file_count - 5)) more${NC}"
        echo ""
    fi
done

if [ $COMMIT_NUM -eq 0 ]; then
    print_warning "No commits to create!"
    exit 0
fi

# ==================== STEP 5: CREATE COMMITS ====================
print_step "Step 5: Create Commits"

echo ""
echo -e "Ready to create ${GREEN}$COMMIT_NUM${NC} feature-specific commits."
echo ""
read -p "Proceed? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Aborted."
    exit 0
fi

# Clear staging area safely
if git rev-parse HEAD >/dev/null 2>&1; then
    git reset HEAD 2>/dev/null || true
fi

echo ""
CURRENT=0
for feature in $COMMIT_ORDER; do
    [ -z "$feature" ] && continue
    CURRENT=$((CURRENT + 1))
    
    title=$(get_commit_title "$feature")
    body=$(get_commit_body "$feature")
    file_count=$(wc -l < "$TEMP_DIR/$feature.files" | tr -d ' ')
    
    print_info "[$CURRENT/$COMMIT_NUM] $title"
    
    # Stage ONLY this feature's files
    while read -r file; do
        git add "$file" 2>/dev/null || true
    done < "$TEMP_DIR/$feature.files"
    
    # Build file list for commit body
    file_list=$(head -10 "$TEMP_DIR/$feature.files" | sed 's/^/- /')
    [ "$file_count" -gt 10 ] && file_list="$file_list
- ... and $((file_count - 10)) more files"
    
    # Create commit
    if git commit -m "$title
$body
Files changed ($file_count):
$file_list" 2>/dev/null; then
        print_success "Created: $title"
    else
        print_warning "Skipped (no changes)"
    fi
done

# ==================== STEP 6: SUMMARY ====================
print_step "Step 6: Summary"

echo ""
echo -e "${WHITE}Created commits:${NC}"
echo ""
git log --oneline -"$COMMIT_NUM" 2>/dev/null || git log --oneline -5 2>/dev/null
echo ""

# ==================== STEP 7: PUSH ====================
print_step "Step 7: Push to GitHub"

echo ""
if [ "$WORKING_BRANCH" = "main" ]; then
    read -p "Push to GitHub (origin/$WORKING_BRANCH)? (y/n) " -n 1 -r
else
    echo -e "Push to feature branch: ${CYAN}origin/$WORKING_BRANCH${NC}"
    read -p "Proceed? (y/n) " -n 1 -r
fi
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if git push -u origin "$WORKING_BRANCH" 2>&1; then
        echo ""
        print_success "Pushed to GitHub!"
        echo ""
        echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
        echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "  View: ${CYAN}https://github.com/${GITHUB_USER}/${REPO_NAME}/commits/${WORKING_BRANCH}${NC}"
        if [ "$WORKING_BRANCH" != "main" ]; then
            echo -e "  PR:   ${CYAN}https://github.com/${GITHUB_USER}/${REPO_NAME}/compare/main...${WORKING_BRANCH}${NC}"
        fi
        echo ""
        echo -e "  ${GOLD}🔥 Frontend: https://holdyourownbrand.vercel.app${NC}"
        echo -e "  ${GOLD}🔥 Backend:  https://holdyourownbrand-production.up.railway.app${NC}"
        echo ""
    else
        print_warning "Push failed - trying force push..."
        read -p "Force push? (OVERWRITES REMOTE) (y/n) " -n 1 -r
        echo ""
        [[ $REPLY =~ ^[Yy]$ ]] && git push -u origin "$WORKING_BRANCH" --force && print_success "Force pushed!"
    fi
else
    print_info "Run when ready: git push -u origin $WORKING_BRANCH"
fi

print_header "Done! 🔥 Hold Your Own! 🔥"
