<script lang="ts">
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
</script>
<div data-theme={data.theme}>
    {@render children()}
</div>