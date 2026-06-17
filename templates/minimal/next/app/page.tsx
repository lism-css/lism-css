import { Lism, Stack, Center, Heading, Text, Link } from 'lism-css/react';

export default function Home() {
  return (
    <Stack min-h="100svh" jc="center">
      <Center as="main" isContainer hasGutter g="40">
        <Heading level="1" ff="accent" fw="normal" ta="center" fz="5xl">
          Minimal Next + Lism CSS
        </Heading>
        <Text ta="center" c="text-2" fz="s">
          Edit{' '}
          <Lism as="code" ff="mono" bgc="base-2" px="10" bdrs="10">
            lism.config.js
          </Lism>{' '}
          and the CSS regenerates automatically in dev.
        </Text>
        <Center>
          <Link
            href="https://lism-css.com/en/docs/"
            set="plain"
            hasTransition
            bgc="text"
            c="base"
            px="30"
            py="20"
            lh="xs"
            bdrs="10"
            hov={{ bxsh: '40', c: 'text', bgc: 'transparent', bd: true, bdc: 'text' }}
          >
            Documentation
          </Link>
        </Center>
      </Center>
    </Stack>
  );
}
