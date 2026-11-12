<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

/**
 * Stateless arithmetic captcha for the public forms. The expected answer lives
 * inside an encrypted, expiring token that the client can't read; each token is
 * accepted once (nonce recorded in cache), so a solved challenge can't be replayed.
 */
class MathCaptcha
{
    private const TTL_MINUTES = 30;

    /** Seconds a human needs at minimum to read and answer; faster submits are bots. */
    private const MIN_AGE_SECONDS = 2;

    /** @return array{a: int, b: int, token: string} */
    public static function issue(): array
    {
        $a = random_int(2, 12);
        $b = random_int(2, 12);

        $token = Crypt::encryptString(json_encode([
            'answer' => $a + $b,
            'nonce' => Str::random(24),
            'iat' => now()->timestamp,
            'exp' => now()->timestamp + self::TTL_MINUTES * 60,
        ]));

        return ['a' => $a, 'b' => $b, 'token' => $token];
    }

    public static function verify(?string $token, mixed $answer): bool
    {
        if (! $token || ! is_numeric($answer)) {
            return false;
        }

        try {
            $payload = json_decode(Crypt::decryptString($token), true);
        } catch (DecryptException) {
            return false;
        }

        if (! is_array($payload) || now()->timestamp > ($payload['exp'] ?? 0) || now()->timestamp - ($payload['iat'] ?? 0) < self::MIN_AGE_SECONDS) {
            return false;
        }

        // Single use: Cache::add only succeeds the first time this nonce is seen. It is
        // burned before comparing, so a wrong guess can't be retried on the same token.
        if (! Cache::add('captcha:'.$payload['nonce'], 1, now()->addMinutes(self::TTL_MINUTES + 1))) {
            return false;
        }

        return (int) $answer === (int) $payload['answer'];
    }
}
