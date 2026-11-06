<?php

namespace Tests\Feature;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class VehicleModelApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_can_list_and_search_models_with_brand(): void
    {
        $brand = VehicleBrand::create(['name' => 'Volkswagen ' . uniqid()]);
        $uniqueSuffix = uniqid();
        $model = VehicleModel::create([
            'brand_id' => $brand->id,
            'name' => "Golf {$uniqueSuffix}",
        ]);

        $response = $this->getJson('/api/models');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'brand_id',
                             'name',
                             'created_at',
                             'updated_at',
                             'brand' => ['id', 'name'],
                         ]
                     ]
                 ]);

        $searchResponse = $this->getJson("/api/models?search=golf+{$uniqueSuffix}");
        $searchResponse->assertStatus(200);
        $data = $searchResponse->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals("Golf {$uniqueSuffix}", $data[0]['name']);
        $this->assertEquals($brand->name, $data[0]['brand']['name']);
    }

    public function test_can_create_model(): void
    {
        $brand = VehicleBrand::create(['name' => 'Porsche ' . uniqid()]);
        $modelName = '911 Carrera ' . uniqid();

        $response = $this->postJson('/api/models', [
            'brand_id' => $brand->id,
            'name' => $modelName,
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'message' => 'Modelo cadastrado com sucesso!',
                     'data' => [
                         'name' => $modelName,
                         'brand_id' => $brand->id,
                     ],
                 ]);

        $this->assertDatabaseHas('vehicle_models', [
            'name' => $modelName,
            'brand_id' => $brand->id,
        ]);
    }

    public function test_cannot_create_model_without_name_or_brand(): void
    {
        $response = $this->postJson('/api/models', [
            'name' => '',
            'brand_id' => null,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'brand_id']);
    }

    public function test_cannot_create_model_with_nonexistent_brand(): void
    {
        $response = $this->postJson('/api/models', [
            'name' => 'Modelo Fantasma',
            'brand_id' => 99999999,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['brand_id']);
    }

    public function test_cannot_create_duplicate_model_for_same_brand(): void
    {
        $brand = VehicleBrand::create(['name' => 'Jeep ' . uniqid()]);
        $modelName = 'Compass ' . uniqid();

        VehicleModel::create([
            'brand_id' => $brand->id,
            'name' => $modelName,
        ]);

        $response = $this->postJson('/api/models', [
            'brand_id' => $brand->id,
            'name' => '  ' . mb_strtoupper($modelName) . '  ',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_can_create_same_model_name_for_different_brands(): void
    {
        $brandA = VehicleBrand::create(['name' => 'Marca A ' . uniqid()]);
        $brandB = VehicleBrand::create(['name' => 'Marca B ' . uniqid()]);
        $commonModelName = 'Special Edition ' . uniqid();

        VehicleModel::create([
            'brand_id' => $brandA->id,
            'name' => $commonModelName,
        ]);

        $response = $this->postJson('/api/models', [
            'brand_id' => $brandB->id,
            'name' => $commonModelName,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('vehicle_models', [
            'name' => $commonModelName,
            'brand_id' => $brandB->id,
        ]);
    }

    public function test_can_update_model_and_reassign_brand(): void
    {
        $brand1 = VehicleBrand::create(['name' => 'Marca 1 ' . uniqid()]);
        $brand2 = VehicleBrand::create(['name' => 'Marca 2 ' . uniqid()]);

        $model = VehicleModel::create([
            'brand_id' => $brand1->id,
            'name' => 'Modelo Antigo ' . uniqid(),
        ]);

        $newModelName = 'Modelo Renomeado ' . uniqid();

        $response = $this->putJson("/api/models/{$model->id}", [
            'name' => $newModelName,
            'brand_id' => $brand2->id,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Modelo atualizado com sucesso!',
                     'data' => [
                         'id' => $model->id,
                         'name' => $newModelName,
                         'brand_id' => $brand2->id,
                     ],
                 ]);

        $this->assertDatabaseHas('vehicle_models', [
            'id' => $model->id,
            'name' => $newModelName,
            'brand_id' => $brand2->id,
        ]);
    }

    public function test_can_delete_model(): void
    {
        $brand = VehicleBrand::create(['name' => 'Nissan ' . uniqid()]);
        $model = VehicleModel::create([
            'brand_id' => $brand->id,
            'name' => 'Sentra ' . uniqid(),
        ]);

        $response = $this->deleteJson("/api/models/{$model->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Modelo excluído com sucesso!',
                 ]);

        $this->assertDatabaseMissing('vehicle_models', [
            'id' => $model->id,
        ]);
    }
}
