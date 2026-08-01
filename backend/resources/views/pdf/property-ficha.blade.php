<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{{ $property->getTranslation('title', 'es', false) }} — Ficha</title>
<style>
    @page {
        margin: 130px 50px 70px 50px;
    }

    * {
        box-sizing: border-box;
    }

    body {
        font-family: Helvetica, Arial, sans-serif;
        color: #454444;
        font-size: 11pt;
        line-height: 1.5;
    }

    .header {
        position: fixed;
        top: -100px;
        left: 0;
        right: 0;
        height: 90px;
        text-align: center;
    }

    .header img {
        height: 34px;
    }

    .header .rule {
        margin-top: 14px;
        border-top: 1px solid #03071c;
    }

    h1, h2 {
        color: #03071c;
        font-weight: normal;
        margin: 0 0 14px 0;
    }

    h1 {
        font-size: 22pt;
        text-align: center;
    }

    h2 {
        font-size: 16pt;
        border-bottom: 1px solid #03071c;
        padding-bottom: 10px;
    }

    .subtitle {
        text-align: center;
        font-size: 12pt;
        color: #454444;
        margin: 0 0 24px 0;
    }

    .hero {
        display: block;
        margin: 0 auto 20px auto;
    }

    .gallery-columns {
        width: 100%;
    }

    .gallery-columns:after {
        content: "";
        display: block;
        clear: both;
    }

    .gallery-col {
        width: 238pt;
    }

    .gallery-col-left {
        float: left;
    }

    .gallery-col-right {
        float: right;
    }

    .gallery-col img {
        display: block;
        width: 100%;
        margin-bottom: 14pt;
    }

    .page-break {
        page-break-before: always;
    }

    table.ficha {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
    }

    table.ficha td {
        padding: 9px 0;
        border-bottom: 1px solid #e2e2e2;
        vertical-align: top;
    }

    table.ficha td.label {
        width: 42%;
        color: #03071c;
        font-weight: bold;
    }

    table.ficha td.value {
        color: #454444;
    }

    .description p {
        margin: 0 0 12px 0;
    }

    .qr-page {
        text-align: center;
        margin-top: 20px;
    }

    .qr-page img {
        width: 180px;
        height: 180px;
        margin-top: 10px;
    }

    .qr-page .url {
        margin-top: 14px;
        font-size: 9pt;
        color: #9a9a9a;
        word-break: break-all;
    }
</style>
</head>
<body>

<div class="header">
    @if ($logoDataUri)
        <img src="{{ $logoDataUri }}" alt="Victoria Fones Real Estate">
    @else
        <strong>VICTORIA FONES</strong>
    @endif
    <div class="rule"></div>
</div>

{{-- Cover: title, address, hero photo, ficha table --}}
<h1>{{ $property->getTranslation('title', 'es', false) }}</h1>
<p class="subtitle">{{ $address }}</p>

@if ($hero)
    <img class="hero" src="{{ $hero['src'] }}" style="width: {{ $hero['width'] }}pt;" alt="">
@endif

<h2>Ficha</h2>
<table class="ficha">
    <tr>
        <td class="label">Nombre de la Propiedad:</td>
        <td class="value">{{ $property->getTranslation('title', 'es', false) }}</td>
    </tr>
    <tr>
        <td class="label">Dirección:</td>
        <td class="value">{{ $address }}</td>
    </tr>
    <tr>
        <td class="label">Código:</td>
        <td class="value">{{ $property->code }}</td>
    </tr>
    <tr>
        <td class="label">Precio USD:</td>
        <td class="value">
            {{ $property->price_usd !== null ? number_format((float) $property->price_usd, 0, ',', '.') : 'Consultar' }}
        </td>
    </tr>
    @if ($property->bedrooms)
        <tr>
            <td class="label">Dormitorios:</td>
            <td class="value">{{ $property->bedrooms }}</td>
        </tr>
    @endif
    @if ($property->bathrooms)
        <tr>
            <td class="label">Baños:</td>
            <td class="value">{{ $property->bathrooms }}</td>
        </tr>
    @endif
    @if ($property->built_area_m2)
        <tr>
            <td class="label">Metros² Cubiertos:</td>
            <td class="value">{{ number_format((float) $property->built_area_m2, 0, ',', '.') }}</td>
        </tr>
    @endif
    <tr>
        <td class="label">Sup Terreno M²:</td>
        <td class="value">{{ $property->lot_area_m2 ? number_format((float) $property->lot_area_m2, 0, ',', '.') : '' }}</td>
    </tr>
    <tr>
        <td class="label">Año de Construcción:</td>
        <td class="value">{{ $property->year_built ?? '' }}</td>
    </tr>
</table>

{{-- Description + gallery heading share a page; photos start on the next one --}}
<div class="page-break">
    <h2>Descripción</h2>
    <div class="description">
        @forelse ($descriptionParagraphs as $paragraph)
            <p>{{ $paragraph }}</p>
        @empty
            <p>—</p>
        @endforelse
    </div>

    @if (! empty($galleryPages))
        <h2>Galería de Fotos</h2>
    @endif
</div>

{{-- Gallery: masonry — two columns, each photo at its own natural aspect ratio --}}
@foreach ($galleryPages as $page)
    <div class="page-break gallery-columns">
        <div class="gallery-col gallery-col-left">
            @foreach ($page['left'] as $image)
                <img src="{{ $image['src'] }}" alt="">
            @endforeach
        </div>
        <div class="gallery-col gallery-col-right">
            @foreach ($page['right'] as $image)
                <img src="{{ $image['src'] }}" alt="">
            @endforeach
        </div>
    </div>
@endforeach

{{-- QR / online listing --}}
<div class="page-break">
    <h2>Ver Ficha Online y Mapa con Ubicación</h2>
    <div class="qr-page">
        <img src="{{ $qrDataUri }}" alt="QR">
        <p class="url">{{ $url }}</p>
    </div>
</div>

</body>
</html>
