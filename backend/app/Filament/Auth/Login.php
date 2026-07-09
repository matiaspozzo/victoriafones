<?php

namespace App\Filament\Auth;

use DanHarrin\LivewireRateLimiting\Exceptions\TooManyRequestsException;
use Filament\Facades\Filament;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Http\Responses\Auth\Contracts\LoginResponse;
use Filament\Models\Contracts\FilamentUser;
use Filament\Pages\Auth\Login as BaseLogin;
use Illuminate\Validation\ValidationException;

/**
 * Hardened admin login: stricter brute-force throttling (5 tries / 5 min) plus
 * a self-contained arithmetic captcha. No external service or API keys — free
 * and works offline.
 */
class Login extends BaseLogin
{
    public int $captchaA = 0;

    public int $captchaB = 0;

    public function mount(): void
    {
        parent::mount();
        $this->newCaptcha();
    }

    protected function newCaptcha(): void
    {
        $this->captchaA = random_int(3, 12);
        $this->captchaB = random_int(3, 12);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                $this->getEmailFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getRememberFormComponent(),
                TextInput::make('captcha')
                    ->label(fn (): string => "Verificación: ¿cuánto es {$this->captchaA} + {$this->captchaB}?")
                    ->required()
                    ->numeric()
                    ->autocomplete('off'),
            ])
            ->statePath('data');
    }

    public function authenticate(): ?LoginResponse
    {
        // Throttle every submit (even wrong captchas) to blunt brute force.
        try {
            $this->rateLimit(5, decaySeconds: 300);
        } catch (TooManyRequestsException $exception) {
            $this->getRateLimitedNotification($exception)?->send();

            return null;
        }

        $data = $this->form->getState();

        // Verify the arithmetic captcha, then rotate it for the next attempt.
        $expected = $this->captchaA + $this->captchaB;
        $this->newCaptcha();

        if ((int) ($data['captcha'] ?? -1) !== $expected) {
            throw ValidationException::withMessages([
                'data.captcha' => 'La verificación es incorrecta. Intentá de nuevo.',
            ]);
        }

        if (! Filament::auth()->attempt($this->getCredentialsFromFormData($data), $data['remember'] ?? false)) {
            $this->throwFailureValidationException();
        }

        $user = Filament::auth()->user();

        if (
            ($user instanceof FilamentUser) &&
            (! $user->canAccessPanel(Filament::getCurrentPanel()))
        ) {
            Filament::auth()->logout();

            $this->throwFailureValidationException();
        }

        session()->regenerate();

        return app(LoginResponse::class);
    }
}
