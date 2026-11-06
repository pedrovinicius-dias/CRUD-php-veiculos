<?php

namespace Tests\Feature;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class VehicleBrandApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_can_list_and_search_brands(): void
    {
        $uniqueSuffix = uniqid();
        $brand1 = VehicleBrand::create(['name' => "Toyota {$uniqueSuffix}"]);
        $brand2 = VehicleBrand::create(['name' => "Honda {$uniqueSuffix}"]);

        $response = $this->getJson('/api/brands');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'models_count', 'created_at', 'updated_at']
                     ]
                 ]);

        $searchResponse = $this->getJson("/api/brands?search=toyota+{$uniqueSuffix}");
        $searchResponse->assertStatus(200);
        $data = $searchResponse->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals("Toyota {$uniqueSuffix}", $data[0]['name']);
    }

    public function test_can_create_brand(): void
    {
        $uniqueName = 'BMW ' . uniqid();
        $response = $this->postJson('/api/brands', [
            'name' => $uniqueName,
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'message' => 'Marca cadastrada com sucesso!',
                     'data' => [
                         'name' => $uniqueName,
                     ],
                 ]);

        $this->assertDatabaseHas('vehicle_brands', [
            'name' => $uniqueName,
        ]);
    }

    public function test_cannot_create_brand_without_name(): void
    {
        $response = $this->postJson('/api/brands', [
            'name' => '',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_create_duplicate_brand(): void
    {
        $suffix = uniqid();
        $originalName = "Audi {$suffix}";
        VehicleBrand::create(['name' => $originalName]);

        $duplicateAttempt = "  AUDI {$suffix}  ";
        $response = $this->postJson('/api/brands', [
            'name' => $duplicateAttempt,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_can_update_brand_name(): void
    {
        $brand = VehicleBrand::create(['name' => 'Volvo ' . uniqid()]);
        $newName = 'Volvo Updated ' . uniqid();

        $response = $this->putJson("/api/brands/{$brand->id}", [
            'name' => $newName,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Marca atualizada com sucesso!',
                     'data' => [
                         'id' => $brand->id,
                         'name' => $newName,
                     ],
                 ]);

        $this->assertDatabaseHas('vehicle_brands', [
            'id' => $brand->id,
            'name' => $newName,
        ]);
    }

    public function test_cannot_delete_brand_with_associated_models(): void
    {
        $brand = VehicleBrand::create(['name' => 'Mercedes-Benz ' . uniqid()]);
        VehicleModel::create([
            'brand_id' => $brand->id,
            'name' => 'Classe C ' . uniqid(),
        ]);

        $response = $this->deleteJson("/api/brands/{$brand->id}");

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Não é possível excluir esta marca, pois existem modelos de veículos vinculados a ela. Exclua ou desvincule os modelos antes de continuar.',
                 ]);

        $this->assertDatabaseHas('vehicle_brands', [
            'id' => $brand->id,
        ]);
    }

    public function test_can_delete_brand_without_models(): void
    {
        $brand = VehicleBrand::create(['name' => 'Ferrari ' . uniqid()]);

        $response = $this->deleteJson("/api/brands/{$brand->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Marca excluída com sucesso!',
                 ]);

        $this->assertDatabaseMissing('vehicle_brands', [
            'id' => $brand->id,
        ]);
    }
}
