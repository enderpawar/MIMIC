import {
  BellIcon,
  ClockIcon,
  CursorClickIcon,
  DiamondSplitIcon,
  HomeIcon,
} from '../components/icons/AppIcons';

export type NodeDefinitionType = 'trigger' | 'action' | 'wait' | 'condition' | 'data';
export type NodeCategory = 'All types' | 'Basic' | 'Flow Control';

export interface NodeDefinition {
  type: NodeDefinitionType;
  /** Primary display label (used as title in Sidebar, label in NodePickerModal) */
  label: string;
  /** Short description used in NodePickerModal */
  desc: string;
  /** Longer description used in Sidebar */
  description: string;
  /** Subtitle line used in Sidebar */
  subtitle: string;
  category: NodeCategory;
  tone: string;
  background: string;
  icon: JSX.Element;
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'trigger',
    label: 'Start Node',
    desc: 'Workflow start',
    description: 'Add workflow start trigger.',
    subtitle: 'Manual trigger',
    category: 'Basic',
    tone: '#2563eb',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    icon: <HomeIcon size={18} />,
  },
  {
    type: 'action',
    label: 'Email Agent',
    desc: 'Click, input, navigate',
    description: 'Add browser actions (click, input, navigate).',
    subtitle: 'Action step',
    category: 'Basic',
    tone: '#ea580c',
    background: 'linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)',
    icon: <CursorClickIcon size={18} />,
  },
  {
    type: 'wait',
    label: 'Creative Writer',
    desc: 'Wait for time or element',
    description: 'Wait for element or duration.',
    subtitle: 'Delay or wait',
    category: 'Flow Control',
    tone: '#d97706',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
    icon: <ClockIcon size={18} />,
  },
  {
    type: 'condition',
    label: 'Condition',
    desc: 'True / false branch',
    description: 'Branch by condition (true/false).',
    subtitle: 'True / false split',
    category: 'Flow Control',
    tone: '#475569',
    background: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)',
    icon: <DiamondSplitIcon size={18} />,
  },
  {
    type: 'data',
    label: 'Notification',
    desc: 'Extract and store data',
    description: 'Extract text or attribute from page.',
    subtitle: 'Extract data',
    category: 'Basic',
    tone: '#7c3aed',
    background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
    icon: <BellIcon size={18} />,
  },
];
