<?php

use App\Http\Controllers\Api\VehicleBrandController;
use App\Http\Controllers\Api\VehicleModelController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Endpoints de CRUD para Marcas de Veículos
Route::apiResource('brands', VehicleBrandController::class);

// Endpoints de CRUD para Modelos de Veículos
Route::apiResource('models', VehicleModelController::class);
