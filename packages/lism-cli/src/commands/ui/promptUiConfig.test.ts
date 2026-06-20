import { beforeEach, describe, expect, it, vi } from 'vitest';
import { select } from '@inquirer/prompts';
import { promptUiConfig } from './promptUiConfig';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
}));

describe('promptUiConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('オプション未指定なら framework のみ対話で聞き、componentsDir/helperDir はデフォルト値を採用する', async () => {
    vi.mocked(select).mockResolvedValue('react');

    const result = await promptUiConfig();

    expect(select).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
  });

  it('framework を指定すると select はスキップされ、プロンプトが一切呼ばれない', async () => {
    const result = await promptUiConfig({ framework: 'astro' });

    expect(select).not.toHaveBeenCalled();
    expect(result).toEqual({ framework: 'astro', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
  });

  it('全オプション指定時は指定値がそのまま使われる', async () => {
    const result = await promptUiConfig({ framework: 'react', componentsDir: 'src/ui', helperDir: 'src/ui/_helper' });

    expect(select).not.toHaveBeenCalled();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/ui', helperDir: 'src/ui/_helper' });
  });

  it('componentsDir 指定時、helperDir の既定値が連動する', async () => {
    const result = await promptUiConfig({ framework: 'react', componentsDir: 'custom' });

    expect(result.helperDir).toBe('custom/_helper');
  });
});
