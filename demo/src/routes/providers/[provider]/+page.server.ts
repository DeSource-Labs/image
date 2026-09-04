import { error } from '@sveltejs/kit';
import { providers } from '$lib/providers';
import { providerDocs } from '$lib/server/provider-docs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
  const provider = providers.find((item) => item.slug === params.provider);
  if (!provider) error(404, 'Provider not found');
  const doc = providerDocs[provider.id];
  const options = Object.fromEntries(
    doc.options.filter((option) => option.value !== null).map((option) => [option.name, option.value])
  );
  const factoryArgs = Object.keys(options).length ? JSON.stringify(options, null, 2).replaceAll('\n', '\n    ') : '';
  const extraConfig = ['ipx', 'ipxStatic', 'vercel', 'awsAmplify'].includes(provider.id)
    ? "\n  domains: ['images.example.com'],"
    : '';
  const screens = ['vercel', 'awsAmplify'].includes(provider.id) ? '\n  screens: { card: 800, card2x: 1600 },' : '';
  const configuration = `import type { ImageConfig } from '@desource/image';\nimport { ${doc.factory} } from '@desource/image/providers/${provider.id}';\n\nexport const imageConfig = {\n  provider: '${provider.id}',${extraConfig}${screens}\n  providers: {\n    ${provider.id}: ${doc.factory}(${factoryArgs})\n  }\n} satisfies ImageConfig;`;
  const { width, height, ...modifiers } = doc.example;
  const jsxWidth = width ? ` width={${width}}` : '';
  const jsxHeight = height ? ` height={${height}}` : '';
  const dimensions = jsxWidth + jsxHeight;
  const modifierProp = Object.keys(modifiers).length ? `\n  modifiers={${JSON.stringify(modifiers, null, 2)}}` : '';
  const svelte = `<script lang="ts">\n  import { Image, setImageConfig } from '@desource/image-svelte';\n  import { imageConfig } from './image.config';\n\n  setImageConfig(imageConfig);\n</script>\n\n<Image\n  src="${doc.src}"\n  alt="Sample image"${dimensions}${modifierProp}\n/>`;
  const react = `import { Image, ImageProvider } from '@desource/image-react';\nimport { imageConfig } from './image.config';\n\nexport function Example() {\n  return (\n    <ImageProvider config={imageConfig}>\n      <Image\n        src="${doc.src}"\n        alt="Sample image"${dimensions}${modifierProp.replaceAll('\n', '\n      ')}\n      />\n    </ImageProvider>\n  );\n}`;
  const angularWidth = width ? `\n      [width]="${width}"` : '';
  const angularHeight = height ? `\n      [height]="${height}"` : '';
  const angularDimensions = angularWidth + angularHeight;
  const angular = `import { Component } from '@angular/core';\nimport { DsImageComponent, provideDsImage } from '@desource/image-angular';\nimport { imageConfig } from './image.config';\n\n@Component({\n  selector: 'app-image-example',\n  imports: [DsImageComponent],\n  providers: [provideDsImage(imageConfig)],\n  template: \`\n    <ds-image\n      src="${doc.src}"\n      alt="Sample image"${angularDimensions}\n      [modifiers]="modifiers"\n    />\n  \`\n})\nexport class ImageExample {\n  readonly modifiers = ${JSON.stringify(modifiers, null, 2).replaceAll('\n', '\n  ')};\n}`;
  return { provider, doc, configuration, examples: { svelte, react, angular }, origin: url.origin };
};
