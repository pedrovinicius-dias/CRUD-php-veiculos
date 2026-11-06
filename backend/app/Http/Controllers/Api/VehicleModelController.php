<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleModelRequest;
use App\Http\Requests\UpdateVehicleModelRequest;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleModelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VehicleModel::with('brand');

        if ($search = $request->input('search')) {
            $cleanedSearch = mb_strtolower(trim($search));
            $query->where(function ($q) use ($cleanedSearch) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$cleanedSearch}%"])
                  ->orWhereHas('brand', function ($brandQuery) use ($cleanedSearch) {
                      $brandQuery->whereRaw('LOWER(name) LIKE ?', ["%{$cleanedSearch}%"]);
                  });
            });
        }

        if ($brandId = $request->input('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        $models = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'data' => $models,
        ]);
    }

    public function store(StoreVehicleModelRequest $request): JsonResponse
    {
        $model = VehicleModel::create($request->validated());
        $model->load('brand');

        return response()->json([
            'message' => 'Modelo cadastrado com sucesso!',
            'data' => $model,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $model = VehicleModel::with('brand')->findOrFail($id);

        return response()->json([
            'data' => $model,
        ]);
    }

    public function update(UpdateVehicleModelRequest $request, string $id): JsonResponse
    {
        $model = VehicleModel::findOrFail($id);
        $model->update($request->validated());
        $model->load('brand');

        return response()->json([
            'message' => 'Modelo atualizado com sucesso!',
            'data' => $model,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $model = VehicleModel::findOrFail($id);
        $model->delete();

        return response()->json([
            'message' => 'Modelo excluído com sucesso!',
        ]);
    }
}
