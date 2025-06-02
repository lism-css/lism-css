export default function isPresetValue(presets, value) {
	if (!Array.isArray(presets)) return false;

	// 数値の時は文字列化してから判定
	if (typeof value === 'number') {
		return presets.includes(`${value}`);
	}
	return presets.includes(value);
}
