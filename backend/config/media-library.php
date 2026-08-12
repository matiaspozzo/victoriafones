<?php

return [

    /*
     * Matches Filament's SpatieMediaLibraryFileUpload::maxSize(32768) on the
     * Property `hero`/`images` fields (see PropertyResource). Spatie's own
     * default here is 10MB and is enforced separately, on save rather than
     * on upload — leaving it at the package default let uploads report
     * success while the save silently 500'd for anything over 10MB.
     */
    'max_file_size' => 1024 * 1024 * 32, // 32MB

];
