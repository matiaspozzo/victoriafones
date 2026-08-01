<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #03071c; margin: 0; padding: 24px; background: #f5f5f4;">
    <table style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7e5;">
        <tr>
            <td style="padding: 24px;">
                <h1 style="font-size: 18px; margin: 0 0 16px;">
                    Nueva consulta {{ $lead->type === 'whatsapp' ? '(WhatsApp)' : '(formulario)' }}
                </h1>

                @if ($lead->property)
                    <p style="margin: 0 0 16px;">
                        <strong>Propiedad:</strong> {{ $lead->property->code }}
                    </p>
                @endif

                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 4px 0; color: #454444; width: 100px;">Nombre</td>
                        <td style="padding: 4px 0;">{{ $lead->name ?: '—' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #454444;">Email</td>
                        <td style="padding: 4px 0;">
                            @if ($lead->email)
                                <a href="mailto:{{ $lead->email }}">{{ $lead->email }}</a>
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #454444;">Teléfono</td>
                        <td style="padding: 4px 0;">{{ $lead->phone ?: '—' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #454444;">Idioma</td>
                        <td style="padding: 4px 0;">{{ strtoupper($lead->locale) }}</td>
                    </tr>
                </table>

                @if ($lead->message)
                    <p style="margin: 16px 0 4px; color: #454444; font-size: 14px;">Mensaje</p>
                    <p style="margin: 0; white-space: pre-line;">{{ $lead->message }}</p>
                @endif

                @if ($lead->source_url)
                    <p style="margin: 16px 0 0; font-size: 12px; color: #454444;">
                        Enviado desde <a href="{{ $lead->source_url }}">{{ $lead->source_url }}</a>
                    </p>
                @endif

                <p style="margin: 16px 0 0; font-size: 12px; color: #454444;">
                    {{ $lead->created_at->format('d/m/Y H:i') }}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
