import type { Meta, StoryObj } from '@storybook/react-vite';
import { Media } from './index';

const meta: Meta = {
  title: 'Core/Media',
  component: Media,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Sample image',
    w: '300px',
  },
};

export const WithObjectFitCover: Story = {
  name: 'objectFit: cover',
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Covered image',
    w: '200px',
    h: '200px',
    style: { objectFit: 'cover' },
  },
};

export const WithObjectFitContain: Story = {
  name: 'objectFit: contain',
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Contained image',
    w: '200px',
    h: '200px',
    style: { objectFit: 'contain' },
    bgc: 'base-2',
  },
};

export const WithObjectPosition: Story = {
  name: 'objectPosition 指定',
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Positioned image',
    w: '200px',
    h: '200px',
    style: { objectFit: 'cover', objectPosition: 'top left' },
  },
};

export const WithVideo: Story = {
  name: 'Video element',
  args: {
    as: 'video',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    controls: true,
    muted: true,
    loop: true,
    w: '300px',
    bd: true,
    d: 'block',
    bdrs: '30',
  },
};

export const WithIframe: Story = {
  name: 'iframe element',
  args: {
    as: 'iframe',
    src: 'https://www.openstreetmap.org/export/embed.html?bbox=139.6917,35.6895,139.7017,35.6995&layer=mapnik',
    title: 'OpenStreetMap',
    w: '400px',
    h: '300px',
    bd: true,
    bdrs: '30',
    d: 'block',
    loading: 'lazy',
  },
};

export const WithPicture: Story = {
  name: 'picture element',
  render: () => (
    <Media as="picture" w="300px" bdrs="30" d="block" style={{ overflow: 'hidden' }}>
      <source srcSet="https://picsum.photos/600/400.webp" type="image/webp" media="(min-width: 600px)" />
      <img src="https://picsum.photos/300/200" alt="Sample picture" style={{ width: '100%', display: 'block' }} />
    </Media>
  ),
};
