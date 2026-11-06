FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    postgresql-dev \
    git \
    unzip \
    libzip-dev \
    icu-dev \
    libpng-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Composer install com flags seguras para ambiente docker sem scripts locais
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

CMD php artisan package:discover --ansi && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT}
