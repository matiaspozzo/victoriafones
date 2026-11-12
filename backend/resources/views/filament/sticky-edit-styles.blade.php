{{--
    Create/edit record pages: keep the header (breadcrumbs, title, language switcher,
    delete) pinned under the topbar, and the save bar pinned to the bottom of the
    viewport — so it's always visible even while scrolling through relation managers
    (e.g. Lotes), which render below the form.
--}}
<style>
    .fi-resource-edit-record-page .fi-header,
    .fi-resource-create-record-page .fi-header {
        position: sticky;
        top: 4rem; /* below the topbar (h-16) */
        z-index: 15;
        padding-block: 0.75rem;
        background: rgb(var(--gray-50));
        /* Extend the background over the page gutters without changing layout. */
        box-shadow: 0 0 0 100vmax rgb(var(--gray-50));
        clip-path: inset(0 -100vmax);
    }

    .fi-resource-edit-record-page .fi-form-actions,
    .fi-resource-create-record-page .fi-form-actions {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 15;
        padding: 0.75rem 1rem;
        background: #fff;
        border-top: 1px solid rgb(var(--gray-200));
        box-shadow: 0 -4px 12px rgb(0 0 0 / 0.06);
    }

    /* Room so the fixed bar never covers the last content. */
    .fi-resource-edit-record-page > section,
    .fi-resource-create-record-page > section {
        padding-bottom: 6rem;
    }

    @media (min-width: 768px) {
        .fi-resource-edit-record-page .fi-form-actions,
        .fi-resource-create-record-page .fi-form-actions {
            padding-inline: 1.5rem;
        }
    }

    @media (min-width: 1024px) {
        .fi-resource-edit-record-page .fi-form-actions,
        .fi-resource-create-record-page .fi-form-actions {
            left: var(--sidebar-width, 0px); /* the sidebar is in-flow on desktop */
            padding-inline: 2rem;
        }
    }

    .dark .fi-resource-edit-record-page .fi-header,
    .dark .fi-resource-create-record-page .fi-header {
        background: rgb(var(--gray-950));
        box-shadow: 0 0 0 100vmax rgb(var(--gray-950));
    }

    .dark .fi-resource-edit-record-page .fi-form-actions,
    .dark .fi-resource-create-record-page .fi-form-actions {
        background: rgb(var(--gray-900));
        border-top-color: rgb(255 255 255 / 0.1);
        box-shadow: 0 -4px 12px rgb(0 0 0 / 0.4);
    }
</style>
