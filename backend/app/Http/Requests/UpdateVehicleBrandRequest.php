<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class UpdateVehicleBrandRequest extends FormRequest
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
        $brandId = $this->route('brand') ?? $this->route('id');
        if (is_object($brandId)) {
            $brandId = $brandId->id;
        }

        return [
            'name' => [
                'required',
                'string',
                'min:1',
                'max:255',
                function ($attribute, $value, $fail) use ($brandId) {
                    $cleaned = mb_strtolower(trim((string) $value));
                    $exists = DB::table('vehicle_brands')
                        ->where('id', '!=', $brandId)
                        ->whereRaw('LOWER(TRIM(name)) = ?', [$cleaned])
                        ->exists();

                    if ($exists) {
                        $fail('Já existe uma marca cadastrada com este nome.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome da marca é obrigatório.',
            'name.string' => 'O nome da marca deve ser um texto válido.',
            'name.max' => 'O nome da marca não pode ultrapassar 255 caracteres.',
        ];
    }
}
