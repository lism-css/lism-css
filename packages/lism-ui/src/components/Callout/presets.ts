type PresetData = {
  icon: string;
  color: string;
};

const POINT_PRESET: PresetData = {
  icon: 'lightbulb',
  color: 'orange',
};

const PRESETS: Record<string, PresetData> = {
  alert: {
    icon: 'alert',
    color: 'red',
  },
  point: POINT_PRESET,
  tip: POINT_PRESET,
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
  note: {
    icon: 'note',
    color: 'gray',
  },
};

export default PRESETS;
