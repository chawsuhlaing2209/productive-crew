import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = { title: 'Components/Button', component: Button };
export default meta;
type Story = StoryObj<typeof Button>;

// One story per state / variant — this is what QA tests against Figma.
export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };
export const Disabled: Story = { args: { variant: 'primary', children: 'Disabled', disabled: true } };
