<?php

namespace App\Support;

use DOMDocument;
use DOMNode;

class HtmlSanitizer
{
    /** Tags Filament's default RichEditor toolbar can produce. */
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
        'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre',
    ];

    private const ALLOWED_LINK_SCHEMES = ['http', 'https', 'mailto', 'tel'];

    /**
     * Strips any tag/attribute not on the allowlist above, so admin-authored
     * rich text (Filament RichEditor, e.g. Property::description) can be
     * rendered with dangerouslySetInnerHTML on the frontend without being a
     * stored-XSS vector — every attribute is dropped except a validated
     * <a href> (javascript:/data: schemes rejected).
     */
    public static function clean(?string $html): ?string
    {
        if (! $html) {
            return $html;
        }

        $dom = new DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8"?>'.$html, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $body = $dom->getElementsByTagName('body')->item(0);
        if (! $body) {
            return '';
        }

        self::cleanChildren($dom, $body);

        $output = '';
        foreach (iterator_to_array($body->childNodes) as $child) {
            $output .= $dom->saveHTML($child);
        }

        return $output;
    }

    private static function cleanChildren(DOMDocument $dom, DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                continue;
            }

            if ($child->nodeType !== XML_ELEMENT_NODE) {
                $node->removeChild($child);

                continue;
            }

            // Clean the subtree first so a disallowed wrapper's *allowed*
            // descendants (e.g. a stray <div><strong>text</strong></div>)
            // are already sanitized by the time we decide to unwrap it below.
            self::cleanChildren($dom, $child);

            if (! in_array($child->nodeName, self::ALLOWED_TAGS, true)) {
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);

                continue;
            }

            $href = $child->nodeName === 'a' ? $child->getAttribute('href') : null;

            foreach (iterator_to_array($child->attributes ?? []) as $attribute) {
                $child->removeAttribute($attribute->name);
            }

            if ($href) {
                $scheme = parse_url($href, PHP_URL_SCHEME);
                if ($scheme === null || in_array(strtolower($scheme), self::ALLOWED_LINK_SCHEMES, true)) {
                    $child->setAttribute('href', $href);
                    $child->setAttribute('target', '_blank');
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
            }
        }
    }
}
