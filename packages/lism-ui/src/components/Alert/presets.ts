import { alertIcon, warningIcon, checkCircleIcon, questionIcon, infoIcon, noteIcon, lightbulbIcon } from '../../helper/icons';

type PresetData = {
  icon: `<svg${string}`;
  color: string;
};

const POINT_PRESET: PresetData = {
  icon: lightbulbIcon,
  color: 'orange',
};

const PRESETS: Record<string, PresetData> = {
  alert: {
    icon: alertIcon,
    color: 'red',
  },
  point: POINT_PRESET,
  tip: POINT_PRESET,
  warning: {
    icon: warningIcon,
    color: 'yellow',
  },
  check: {
    icon: checkCircleIcon,
    color: 'green',
  },
  help: {
    icon: questionIcon,
    color: 'purple',
  },
  info: {
    icon: infoIcon,
    color: 'blue',
  },
  note: {
    icon: noteIcon,
    color: 'gray',
  },
};

export default PRESETS;
