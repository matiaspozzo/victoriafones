<?php

namespace App\Services;

use App\Models\Property;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfDocument;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Printable property spec sheet ("ficha") for the agency to hand/email to
 * clients — rebuilt from a WordPress-era PDF (see the reference the client
 * shared). Spanish only: it's local print material for Uruguayan clients,
 * same as the original.
 */
class PropertyFichaPdf
{
    /**
     * Gallery layout constants (in PDF points). Two masonry columns sized to
     * fit the page's content width (A4 = 595pt wide, minus the 50pt left/right
     *
     * @page margins = 495pt), with a 14pt gutter between them.
     */
    private const GALLERY_COLUMN_WIDTH = 238.0;

    private const GALLERY_GAP = 14.0;

    /** Content budget per page before starting a new one (A4 height 842pt, minus @page top/bottom margins, minus a safety margin). */
    private const GALLERY_MAX_PAGE_HEIGHT = 560.0;

    public function render(Property $property): PdfDocument
    {
        $property->loadMissing(['neighborhood.parent.parent', 'amenities']);

        $url = rtrim((string) config('services.frontend.url'), '/')."/propiedades/{$property->getTranslation('slug', 'es', false)}";

        $qr = (new Builder(writer: new PngWriter, data: $url, size: 320, margin: 0))->build();

        $heroMedia = $property->getFirstMedia('hero') ?? $property->getFirstMedia('images');
        $hero = $heroMedia ? $this->heroImage($heroMedia) : null;

        $pdf = Pdf::loadView('pdf.property-ficha', [
            'property' => $property,
            'url' => $url,
            'qrDataUri' => 'data:image/png;base64,'.base64_encode($qr->getString()),
            'logoDataUri' => $this->fileToDataUri(public_path('brand/logo-azul@2x.webp'), 'image/webp'),
            'hero' => $hero,
            'galleryPages' => $this->galleryPages($property->getMedia('images')),
            'address' => $this->addressLine($property),
            'descriptionParagraphs' => $this->descriptionParagraphs($property),
        ])->setPaper('a4');

        // page_text()'s "{PAGE_NUM}"/"{PAGE_COUNT}" placeholders only resolve
        // to the real total if the pages already exist when it's called —
        // Barryvdh's output()/download() render lazily, so force it here
        // first (output() below then sees $rendered=true and won't redo it).
        $pdf->render();
        $dompdf = $pdf->getDomPDF();
        $dompdf->getCanvas()->page_text(
            $dompdf->getCanvas()->get_width() - 80,
            $dompdf->getCanvas()->get_height() - 48,
            '{PAGE_NUM}/{PAGE_COUNT}',
            $dompdf->getFontMetrics()->getFont('Helvetica'),
            9,
            [0.6, 0.6, 0.6],
        );

        return $pdf;
    }

    /** Localized filename for the download prompt, e.g. "PFD30-ficha.pdf". */
    public function filename(Property $property): string
    {
        return "{$property->code}-ficha.pdf";
    }

    /**
     * Neighborhood breadcrumb, e.g. "Laguna Escondida, José Ignacio" — walks
     * up the parent chain the same way the frontend's meta descriptions do.
     */
    private function addressLine(Property $property): string
    {
        $names = [];
        $neighborhood = $property->neighborhood;

        while ($neighborhood) {
            $names[] = $neighborhood->getTranslation('name', 'es', false);
            $neighborhood = $neighborhood->parent;
        }

        return implode(', ', array_filter($names)) ?: '—';
    }

    /**
     * The RichEditor description is HTML — flatten it to paragraphs for the
     * PDF instead of dumping raw markup.
     *
     * @return array<int, string>
     */
    private function descriptionParagraphs(Property $property): array
    {
        $html = (string) $property->getTranslation('description', 'es', false);
        $withBreaks = preg_replace('/<\/p>|<br\s*\/?>/i', "\n", $html) ?? $html;
        $text = strip_tags($withBreaks);

        return array_values(array_filter(array_map('trim', explode("\n", $text)), fn (string $line) => $line !== ''));
    }

    /**
     * Bin-packs the gallery into masonry pages: each image keeps its real
     * aspect ratio (no crop/stretch — dompdf doesn't support `object-fit`, so
     * forcing every tile to a fixed box was squishing portrait photos), and
     * gets greedily assigned to whichever of the two columns is currently
     * shorter. Once a column would overflow the page, the page closes and a
     * new one starts, so a group never gets cut mid-page.
     *
     * @return array<int, array{left: array, right: array}>
     */
    private function galleryPages(Collection $mediaItems): array
    {
        $pages = [];
        $left = [];
        $right = [];
        $leftHeight = 0.0;
        $rightHeight = 0.0;

        foreach ($mediaItems as $media) {
            $image = $this->image($media, self::GALLERY_COLUMN_WIDTH);
            if (! $image) {
                continue;
            }

            $useLeft = $leftHeight <= $rightHeight;
            $currentHeight = $useLeft ? $leftHeight : $rightHeight;
            $addedHeight = $image['height'] + ($currentHeight > 0 ? self::GALLERY_GAP : 0);

            if ($currentHeight > 0 && $currentHeight + $addedHeight > self::GALLERY_MAX_PAGE_HEIGHT) {
                $pages[] = ['left' => $left, 'right' => $right];
                $left = [];
                $right = [];
                $leftHeight = 0.0;
                $rightHeight = 0.0;
                $useLeft = true;
                $addedHeight = $image['height'];
            }

            if ($useLeft) {
                $left[] = $image;
                $leftHeight += $addedHeight;
            } else {
                $right[] = $image;
                $rightHeight += $addedHeight;
            }
        }

        if ($left !== [] || $right !== []) {
            $pages[] = ['left' => $left, 'right' => $right];
        }

        return $pages;
    }

    private const HERO_MAX_WIDTH = 495.0;

    private const HERO_MAX_HEIGHT = 320.0;

    /**
     * The cover photo, sized to its real aspect ratio within a bounding box
     * — width-constrained for landscape shots (the common case), but
     * height-constrained instead for a tall/portrait one, so it's never
     * stretched to fill a fixed box.
     *
     * @return array{src: string, width: float, height: float}|null
     */
    private function heroImage(Media $media): ?array
    {
        $image = $this->image($media, self::HERO_MAX_WIDTH);
        if (! $image) {
            return null;
        }

        if ($image['height'] <= self::HERO_MAX_HEIGHT) {
            return ['src' => $image['src'], 'width' => self::HERO_MAX_WIDTH, 'height' => $image['height']];
        }

        $ratio = $image['height'] / self::HERO_MAX_WIDTH;

        return [
            'src' => $image['src'],
            'width' => round(self::HERO_MAX_HEIGHT / $ratio, 1),
            'height' => self::HERO_MAX_HEIGHT,
        ];
    }

    /**
     * Reads a media file's real dimensions and returns a data URI plus the
     * height (in points) it should render at for the given column width, so
     * its original aspect ratio is preserved.
     *
     * @return array{src: string, height: float}|null
     */
    private function image(Media $media, float $columnWidth): ?array
    {
        // Conversions are already sized sensibly (full = max 1920px, aspect
        // preserved) and generated as webp. Some older media rows predate
        // that switch though (their `generated_conversions` flag is stale
        // relative to what's actually on disk) — fall back to a downscaled,
        // recompressed copy of the original rather than embedding nothing.
        $conversionPath = $media->hasGeneratedConversion('full') ? $media->getPath('full') : null;

        if ($conversionPath && is_file($conversionPath)) {
            $bytes = @file_get_contents($conversionPath);
            $mime = 'image/webp';
        } else {
            $resized = $this->resizedImage($media->getPath(), 1300);
            $bytes = $resized['bytes'] ?? null;
            $mime = 'image/jpeg';
        }

        if (! $bytes) {
            return null;
        }

        $size = @getimagesizefromstring($bytes);
        if (! $size || $size[0] <= 0) {
            return null;
        }

        [$width, $height] = $size;

        return [
            'src' => "data:{$mime};base64,".base64_encode($bytes),
            'height' => round($columnWidth * ($height / $width), 1),
        ];
    }

    private function fileToDataUri(?string $path, string $mime): ?string
    {
        if (! $path || ! is_file($path)) {
            return null;
        }

        return "data:{$mime};base64,".base64_encode(file_get_contents($path));
    }

    /** @return array{bytes: string}|null */
    private function resizedImage(?string $path, int $maxDimension, int $quality = 75): ?array
    {
        if (! $path || ! is_file($path)) {
            return null;
        }

        $bytes = @file_get_contents($path);
        $image = $bytes ? @imagecreatefromstring($bytes) : false;
        if (! $image) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxDimension / max($width, $height));

        if ($scale < 1) {
            $targetW = max(1, (int) round($width * $scale));
            $targetH = max(1, (int) round($height * $scale));
            $resized = imagecreatetruecolor($targetW, $targetH);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetW, $targetH, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        ob_start();
        imagejpeg($image, null, $quality);
        $jpeg = ob_get_clean();
        imagedestroy($image);

        return $jpeg === false ? null : ['bytes' => $jpeg];
    }
}
