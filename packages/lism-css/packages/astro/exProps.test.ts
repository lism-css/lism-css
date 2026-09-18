import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Lism from './Lism/Lism.astro';
import Box from './layout/Box/Box.astro';
import Layer from './state/Layer/Layer.astro';
import BoxLink from './state/BoxLink/BoxLink.astro';
import Decorator from './atomic/Decorator/Decorator.astro';
import Spacer from './atomic/Spacer/Spacer.astro';
import Divider from './atomic/Divider/Divider.astro';

const components = { Lism, Box, Layer, BoxLink, Decorator, Spacer, Divider };

describe('exProps', () => {
  // rows / cols は Lism Props と同名。getLismProps を通ると属性ではなく --rows / --cols になる
  test.each(Object.entries(components))('%s: exProps が getLismProps を経由せず直接渡される', async (_name, Component) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Component, {
      props: { exProps: { rows: '3', cols: '40' } },
    });

    expect(html).toContain('rows="3"');
    expect(html).toContain('cols="40"');
    expect(html).not.toContain('--rows');
    expect(html).not.toContain('--cols');
  });
});
