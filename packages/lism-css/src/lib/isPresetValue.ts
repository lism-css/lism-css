import isMemberOf from './helper/isMemberOf';

type PresetValue = Set<string> | string[] | readonly string[];

export default function isPresetValue(presets: PresetValue, value: unknown): boolean {
  return isMemberOf(presets, value);
}
