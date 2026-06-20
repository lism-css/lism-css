import { beforeEach, describe, expect, it, vi } from 'vitest';
import { select, input } from '@inquirer/prompts';
import { promptUiConfig } from './promptUiConfig';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  input: vi.fn(),
}));

describe('promptUiConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('オプション未指定なら framework/componentsDir/helperDir を全て対話で聞く', async () => {
    vi.mocked(select).mockResolvedValue('react');
    vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');

    const result = await promptUiConfig();

    expect(select).toHaveBeenCalledTimes(1);
    expect(input).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
  });

  it('framework を指定すると select はスキップされる', async () => {
    vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');

    const result = await promptUiConfig({ framework: 'astro' });

    expect(select).not.toHaveBeenCalled();
    expect(input).toHaveBeenCalledTimes(2);
    expect(result.framework).toBe('astro');
  });

  it('全オプション指定時は prompt が一切呼ばれない', async () => {
    const result = await promptUiConfig({ framework: 'react', componentsDir: 'src/ui', helperDir: 'src/ui/_helper' });

    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/ui', helperDir: 'src/ui/_helper' });
  });

  it('componentsDir 指定時、helperDir の prompt デフォルト値が連動する', async () => {
    vi.mocked(input).mockResolvedValueOnce('custom/_helper');

    await promptUiConfig({ framework: 'react', componentsDir: 'custom' });

    expect(input).toHaveBeenCalledTimes(1);
    expect(vi.mocked(input).mock.calls[0][0]).toMatchObject({ default: 'custom/_helper' });
  });
});
