<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Support\MathCaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadCaptchaTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $extra = []): array
    {
        return $extra + ['type' => 'form', 'name' => 'Test', 'email' => 'test@example.com', 'message' => 'Hola'];
    }

    private function solved(int $ageSeconds = 5): array
    {
        $this->travel(-$ageSeconds)->seconds();
        $c = MathCaptcha::issue();
        $this->travelBack();

        return ['captcha_token' => $c['token'], 'captcha_answer' => $c['a'] + $c['b']];
    }

    public function test_captcha_endpoint_issues_a_challenge(): void
    {
        $this->getJson('/api/captcha')
            ->assertOk()
            ->assertJsonStructure(['a', 'b', 'token'])
            ->assertHeader('Cache-Control');
    }

    public function test_lead_with_correct_answer_is_stored(): void
    {
        $this->postJson('/api/leads', $this->payload($this->solved()))->assertCreated();
        $this->assertDatabaseCount('leads', 1);
    }

    public function test_lead_without_captcha_is_rejected(): void
    {
        $this->postJson('/api/leads', $this->payload())->assertUnprocessable();
        $this->assertSame(0, Lead::count());
    }

    public function test_wrong_answer_is_rejected(): void
    {
        $c = $this->solved();
        $c['captcha_answer']++;
        $this->postJson('/api/leads', $this->payload($c))->assertUnprocessable()->assertJsonValidationErrors('captcha_answer');
    }

    public function test_wrong_guess_burns_the_token(): void
    {
        $c = $this->solved();
        $wrong = ['captcha_answer' => $c['captcha_answer'] + 1] + $c;
        $this->postJson('/api/leads', $this->payload($wrong))->assertUnprocessable();
        $this->postJson('/api/leads', $this->payload($c))->assertUnprocessable();
        $this->assertSame(0, Lead::count());
    }

    public function test_token_cannot_be_replayed(): void
    {
        $c = $this->solved();
        $this->postJson('/api/leads', $this->payload($c))->assertCreated();
        $this->postJson('/api/leads', $this->payload($c))->assertUnprocessable();
        $this->assertSame(1, Lead::count());
    }

    public function test_instant_submit_is_rejected(): void
    {
        $this->postJson('/api/leads', $this->payload($this->solved(0)))->assertUnprocessable();
    }

    public function test_expired_token_is_rejected(): void
    {
        $c = $this->solved(31 * 60);
        $this->postJson('/api/leads', $this->payload($c))->assertUnprocessable();
    }

    public function test_garbage_token_is_rejected(): void
    {
        $this->postJson('/api/leads', $this->payload(['captcha_token' => 'garbage', 'captcha_answer' => 1]))->assertUnprocessable();
        $this->assertSame(0, Lead::count());
    }
}
