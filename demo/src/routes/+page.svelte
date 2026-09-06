<script lang="ts">
  import ApiSection from '$lib/home/ApiSection.svelte';
  import AutodetectSection from '$lib/home/AutodetectSection.svelte';
  import BenefitsSection from '$lib/home/BenefitsSection.svelte';
  import ComparisonSection from '$lib/home/ComparisonSection.svelte';
  import CtaSection from '$lib/home/CtaSection.svelte';
  import FrameworkGuide from '$lib/home/FrameworkGuide.svelte';
  import HeroSection from '$lib/home/HeroSection.svelte';
  import PlaygroundSection from '$lib/home/PlaygroundSection.svelte';
  import ProvidersSection from '$lib/home/ProvidersSection.svelte';
  import SiteHeader from '$lib/home/SiteHeader.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>DeSource Image - Optimized images for React, Angular, and Svelte</title>
  <meta
    name="description"
    content="High-quality image optimization with responsive, provider-first and SSR-friendly workflow for React/Next.js, Angular, and Svelte/SvelteKit."
  />
  <link rel="canonical" href={`${data.origin}/`} />
  <meta property="og:title" content="DeSource Image - Optimized images for React, Angular, and Svelte" />
  <meta
    property="og:description"
    content="Change image quality, format, crop, or responsive sizes in code. DeSource Image selects the image optimizer from the deployment environment."
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="DeSource Image" />
  <meta property="og:url" content={`${data.origin}/`} />
  <meta property="og:image" content={`${data.origin}/og.jpg`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="DeSource Image optimization for React, Angular, and Svelte" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="DeSource Image - Optimized images for React, Angular, and Svelte" />
  <meta
    name="twitter:description"
    content="Responsive images, modern formats, deployment-aware provider selection, 46 providers, and local IPX."
  />
  <meta name="twitter:image" content={`${data.origin}/og.jpg`} />
  <meta name="twitter:image:alt" content="DeSource Image optimization for React, Angular, and Svelte" />
</svelte:head>

<SiteHeader />
<main id="top">
  <HeroSection />
  <BenefitsSection />
  <AutodetectSection />
  <PlaygroundSection />
  <FrameworkGuide />
  <ProvidersSection />
  <ComparisonSection />
  <ApiSection />
  <CtaSection />
</main>
