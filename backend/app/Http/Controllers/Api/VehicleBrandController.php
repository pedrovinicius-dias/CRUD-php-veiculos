<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleBrandRequest;
use App\Http\Requests\UpdateVehicleBrandRequest;
use App\Models\VehicleBrand;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleBrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VehicleBrand::query()->withCount('models');

        if ($search = $request->input('search')) {
            $cleanedSearch = mb_strtolower(trim($search));
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$cleanedSearch}%"]);
        }

        $brands = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'data' => $brands,
        ]);
    }

    public function store(StoreVehicleBrandRequest $request): JsonResponse
    {
        $brand = VehicleBrand::create($request->validated());

        return response()->json([
            'message' => 'Marca cadastrada com sucesso!',
            'data' => $brand,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $brand = VehicleBrand::withCount('models')->findOrFail($id);

        return response()->json([
            'data' => $brand,
        ]);
    }

    public function update(UpdateVehicleBrandRequest $request, string $id): JsonResponse
    {
        $brand = VehicleBrand::findOrFail($id);
        $brand->update($request->validated());

        return response()->json([
            'message' => 'Marca atualizada com sucesso!',
            'data' => $brand,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $brand = VehicleBrand::withCount('models')->findOrFail($id);

        if ($brand->models_count > 0) {
            return response()->json([
                'message' => 'Não é possível excluir esta marca, pois existem modelos de veículos vinculados a ela. Exclua ou desvincule os modelos antes de continuar.',
            ], 422);
        }

        try {
            $brand->delete();

            return response()->json([
                'message' => 'Marca excluída com sucesso!',
            ]);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Não é possível excluir esta marca, pois existem modelos de veículos vinculados a ela. Exclua ou desvincule os modelos antes de continuar.',
            ], 422);
        }
    }
}
