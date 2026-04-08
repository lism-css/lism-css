import type { Meta, StoryObj } from '@storybook/react-vite';
import NavMenu from './react';

const meta: Meta = {
  title: 'UI/NavMenu',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <NavMenu.Root>
      <NavMenu.Item>
        <NavMenu.Link href="#">ホーム</NavMenu.Link>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link href="#">ブログ</NavMenu.Link>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link href="#">お問い合わせ</NavMenu.Link>
      </NavMenu.Item>
    </NavMenu.Root>
  ),
};

export const WithNest: Story = {
  name: 'ネスト（サブメニュー）付き',
  render: () => (
    <NavMenu.Root>
      <NavMenu.Item>
        <NavMenu.Link href="#">ホーム</NavMenu.Link>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link>サービス</NavMenu.Link>
        <NavMenu.Nest>
          <NavMenu.Item>
            <NavMenu.Link href="#">サービス A</NavMenu.Link>
          </NavMenu.Item>
          <NavMenu.Item>
            <NavMenu.Link href="#">サービス B</NavMenu.Link>
          </NavMenu.Item>
        </NavMenu.Nest>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link href="#">お問い合わせ</NavMenu.Link>
      </NavMenu.Item>
    </NavMenu.Root>
  ),
};

export const WithHoverColor: Story = {
  name: 'ホバーカラー指定',
  render: () => (
    <NavMenu.Root hovBgc="base-2" itemP="10">
      <NavMenu.Item>
        <NavMenu.Link href="#">ホーム</NavMenu.Link>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link href="#">ブログ</NavMenu.Link>
      </NavMenu.Item>
      <NavMenu.Item>
        <NavMenu.Link href="#">お問い合わせ</NavMenu.Link>
      </NavMenu.Item>
    </NavMenu.Root>
  ),
};
