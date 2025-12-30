type PresetData = {
	icon: string;
	color: string;
};

const PRESETS: Record<string, PresetData> = {
	alert: {
		icon: 'alert',
		color: 'red',
	},
	point: {
		icon: 'lightbulb',
		color: 'orange',
	},
	warning: {
		icon: 'warning',
		color: 'yellow',
	},
	check: {
		icon: 'check-circle',
		color: 'green',
	},
	help: {
		icon: 'question',
		color: 'purple',
	},
	info: {
		icon: 'info',
		color: 'blue',
	},
};

export default PRESETS;
