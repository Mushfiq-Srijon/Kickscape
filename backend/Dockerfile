FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project
COPY . .

# Create required directories and set permissions BEFORE composer install
RUN mkdir -p bootstrap/cache storage/framework/sessions \
    storage/framework/views storage/framework/cache storage/logs \
    && chmod -R 775 bootstrap/cache storage

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8080

CMD php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}