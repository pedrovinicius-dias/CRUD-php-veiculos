<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class UpdateVehicleModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && is_string($this->name)) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }
    }

    public function rules(): array
    {
        $brandId = $this->input('brand_id');
        $modelId = $this->route('model') ?? $this->route('id');
        if (is_object($modelId)) {
            $modelId = $modelId->id;
        }

        return [
            'brand_id' => [
                'required',
                'integer',
                'exists:vehicle_brands,id',
            ],
            'name' => [
                'required',
                'string',
                'min:1',
                'max:255',
                function ($attribute, $value, $fail) use ($brandId, $modelId) {
                    if (!$brandId) return;

                    $cleaned = mb_strtolower(trim((string) $value));
                    $exists = DB::table('vehicle_models')
                        ->where('brand_id', $brandId)
                        ->where('id', '!=', $modelId)
                        ->whereRaw('LOWER(TRIM(name)) = ?', [$cleaned])
                        ->exists();

                    if ($exists) {
                        $fail('Já existe um modelo com este nome cadastrado para a marca selecionada.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'brand_id.required' => 'A marca do veículo é obrigatória.',
            'brand_id.integer' => 'O identificador da marca deve ser válido.',
            'brand_id.exists' => 'A marca selecionada não existe no sistema.',
            'name.required' => 'O nome do modelo é obrigatório.',
            'name.string' => 'O nome do modelo deve ser um texto válido.',
            'name.max' => 'O nome do modelo não pode ultrapassar 255 caracteres.',
        ];
    }
}
