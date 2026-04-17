# 1. Use the official PHP image with Apache web server
FROM php:8.2-apache

# 2. Install system dependencies and PostgreSQL drivers (Crucial for Neon.tech!)
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

# 3. Enable Apache URL rewriting (Required for Laravel routing)
RUN a2enmod rewrite

# 4. Tell Apache to serve from Laravel's 'public' folder instead of the root
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Copy your Laravel backend code into the server
COPY . /var/www/html

# 6. Install Composer (PHP package manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# 8. Give the server permission to write to Laravel's storage (for logs and uploads)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. Expose port 80 for Render to route traffic
EXPOSE 80