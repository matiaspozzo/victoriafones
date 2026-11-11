<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewLeadReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead)
    {
        $this->lead->loadMissing(['property', 'development']);
    }

    public function build(): self
    {
        $subject = match (true) {
            $this->lead->property !== null => "Nueva consulta — {$this->lead->property->code}",
            $this->lead->development !== null => 'Nueva consulta — Desarrollo '.$this->lead->development->getTranslation('title', 'es'),
            default => 'Nueva consulta',
        };

        return $this
            ->subject($subject)
            ->view('emails.leads.new');
    }
}
