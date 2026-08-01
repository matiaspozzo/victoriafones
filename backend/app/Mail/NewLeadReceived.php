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
        $this->lead->loadMissing('property');
    }

    public function build(): self
    {
        $subject = $this->lead->property
            ? "Nueva consulta — {$this->lead->property->code}"
            : 'Nueva consulta';

        return $this
            ->subject($subject)
            ->view('emails.leads.new');
    }
}
