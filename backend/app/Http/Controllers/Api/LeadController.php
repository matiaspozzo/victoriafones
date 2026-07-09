<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'property_id' => ['nullable', 'exists:properties,id'],
            'type' => ['required', 'in:form,whatsapp'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'locale' => ['nullable', 'in:es,en,pt'],
            'source_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $lead = Lead::create($data + ['locale' => $data['locale'] ?? 'es']);

        return response()->json(['id' => $lead->id], 201);
    }
}
