FROM postgres:13

# Install build dependencies for pgcrypto
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-server-dev-13 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pgcrypto extension
RUN cd /usr/share/postgresql/13/extension && \
    pg_config --version && \
    pg_config --sharedir && \
    pg_config --libdir

# The pgcrypto extension is already included in PostgreSQL 13 by default
# This Dockerfile ensures it's available and can be enabled

# Set environment variables
ENV POSTGRES_DB=authdb
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres123

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY auth_functions.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pg_isready -U postgres || exit 1
