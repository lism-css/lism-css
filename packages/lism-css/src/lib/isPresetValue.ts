type PresetValue = Set<string> | string[];

export default function isPresetValue(
	presets: PresetValue,
	value: string | number
): boolean {
	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		value = `${value}`;
	}

	if (presets instanceof Set) {
		return presets.has(value);
	} else if (Array.isArray(presets)) {
		return presets.includes(value);
	}

	return false;
}
