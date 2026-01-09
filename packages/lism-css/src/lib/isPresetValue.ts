type PresetValue = Set<string> | string[] | readonly string[];

export default function isPresetValue(
	presets: PresetValue,
	value: unknown
): boolean {
	// 数値の時は文字列化してから判定
	let stringValue: string;
	if (typeof value === 'number') {
		stringValue = `${value}`;
	} else if (typeof value === 'string') {
		stringValue = value;
	} else {
		return false;
	}

	if (presets instanceof Set) {
		return presets.has(stringValue);
	} else if (Array.isArray(presets)) {
		return presets.includes(stringValue);
	}

	return false;
}
