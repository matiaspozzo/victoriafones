<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewLeadReceived;
use App\Models\Lead;
use App\Support\MathCaptcha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class LeadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'property_id' => ['nullable', 'exists:properties,id'],
            'development_id' => ['nullable', 'exists:developments,id'],
            'type' => ['required', 'in:form,whatsapp'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'locale' => ['nullable', 'in:es,en,pt'],
            'source_url' => ['nullable', 'url', 'max:2048'],
            'captcha_token' => ['required', 'string'],
            'captcha_answer' => ['required'],
        ]);

        if (! MathCaptcha::verify($data['captcha_token'], $data['captcha_answer'])) {
            throw ValidationException::withMessages(['captcha_answer' => 'invalid_captcha']);
        }

        unset($data['captcha_token'], $data['captcha_answer']);

        $lead = Lead::create($data + ['locale' => $data['locale'] ?? 'es']);

        // The lead is already saved regardless of whether this succeeds — a broken
        // mail config shouldn't turn a successful submission into a 500 for the visitor.
        $notifyEmail = config('services.leads.notify_email');
        if ($notifyEmail) {
            try {
                Mail::to($notifyEmail)->send(new NewLeadReceived($lead));
            } catch (\Throwable $e) {
                Log::warning('Lead notification email failed: '.$e->getMessage());
            }
        }

        return response()->json(['id' => $lead->id], 201);
    }
}
