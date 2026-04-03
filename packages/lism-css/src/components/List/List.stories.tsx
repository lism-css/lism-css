import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from '../Group';
import { List, ListItem } from './index';

const meta: Meta<typeof List> = {
  title: 'Core/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => (
    <List g="10">
      <ListItem>Item 1</ListItem>
      <ListItem>Item 2</ListItem>
      <ListItem>Item 3</ListItem>
    </List>
  ),
};

export const AsOl: Story = {
  name: 'as="ol"',
  render: () => (
    <List as="ol" g="10">
      <ListItem>First</ListItem>
      <ListItem>Second</ListItem>
      <ListItem>Third</ListItem>
    </List>
  ),
};

export const AsDl: Story = {
  name: 'as="dl"',
  render: () => (
    <List as="dl" g="5">
      <ListItem as="dt" fw="bold">
        Term 1
      </ListItem>
      <ListItem as="dd">Description for term 1.</ListItem>
      <ListItem as="dt" fw="bold">
        Term 2
      </ListItem>
      <ListItem as="dd">Description for term 2.</ListItem>
    </List>
  ),
};

export const AsDlWithDiv: Story = {
  name: 'as="dl" > Group > dt + dd',
  render: () => (
    <List as="dl" g="5">
      <Group>
        <ListItem as="dt" fw="bold">
          Term 1
        </ListItem>
        <ListItem as="dd">Description for term 1.</ListItem>
      </Group>
      <Group>
        <ListItem as="dt" fw="bold">
          Term 2
        </ListItem>
        <ListItem as="dd">Description for term 2.</ListItem>
      </Group>
    </List>
  ),
};
