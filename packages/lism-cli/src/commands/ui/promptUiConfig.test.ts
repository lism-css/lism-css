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

  it('オプション未指定なら framework のみ対話で聞き、dir はデフォルト値を採用する', async () => {
    vi.mocked(select).mockResolvedValue('react');

    const result = await promptUiConfig();

    expect(select).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ framework: 'react', dir: 'src/components/ui' });
  });

  it('framework を指定すると select はスキップされ、プロンプトが一切呼ばれない', async () => {
    const result = await promptUiConfig({ framework: 'astro' });

    expect(select).not.toHaveBeenCalled();
    expect(result).toEqual({ framework: 'astro', dir: 'src/components/ui' });
  });

  it('全オプション指定時は指定値がそのまま使われる', async () => {
    const result = await promptUiConfig({ framework: 'react', dir: 'src/ui' });

    expect(select).not.toHaveBeenCalled();
    expect(result).toEqual({ framework: 'react', dir: 'src/ui' });
  });
});
