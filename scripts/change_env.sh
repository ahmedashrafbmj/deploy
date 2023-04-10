# !/bin/sh
# Change working environment.

__usage="
Usage: $(basename $0) [OPTIONS]

Options:
  -d, --dev     Change to development environment
  -p, --prod    Change to production environment
"

# if empty parameter is passed
if [ $# -lt 1 ]; then
    echo "[ERROR]: Please enter an environment to switch to"
    echo "$__usage"
    # echo "Dev: -d or"
    exit 1
fi

#
# DEVELOPMENT
#
if [ $1 = "-d" ] || [ $1 = "--dev" ]; then
    # rename environment files
    mv .env.disabled .env >/dev/null 2>&1
    mv prisma/.env prisma/.env.disabled >/dev/null 2>&1

    # generate new prisma client
    npx prisma generate
#
# PRODUCTION
#
elif [ $1 = "-p" ] || [ $1 = "--prod" ]; then
    # rename environment files
    mv .env .env.disabled >/dev/null 2>&1
    mv prisma/.env.disabled prisma/.env >/dev/null 2>&1

    # generate new prisma client
    npx prisma generate
fi
