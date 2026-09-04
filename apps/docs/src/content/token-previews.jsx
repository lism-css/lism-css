import { Box, Flex, Inline, Stack, Center } from 'lism-css/react';
import { DummyText } from '@lism-css/ui/react/DummyText';

export const FzDemos = ({ lang = 'ja' }) => (
  <Stack g="20" ar="16/9" ov-y="auto" ov-x="clip" p="15">
    {['2xs', 'xs', 's', 'base', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'].map((fz, _i) => {
      return (
        <Stack key={fz} g="5">
          <Inline className="is--sizeTip u--trim" fz="12px" hl="s">
            <code>{fz}</code>
          </Inline>
          <DummyText lang={lang} length="s" fz={fz} className="-whs:nowrap -hl:0" />
        </Stack>
      );
    })}
  </Stack>
);

export const LthDemos = ({ lang = 'ja' }) => (
  <Stack g="20" ov-y="auto" ov-x="clip">
    {['xs', 's', 'base', 'l', 'xl'].map((lts, _i) => {
      return (
        <Stack key={lts} g="5">
          <Inline className="is--sizeTip u--trim" fz="12px" hl="s">
            <code>{lts}</code>
          </Inline>
          <DummyText lang={lang} length="s" lts={lts} className="-whs:nowrap -hl:xs" />
          {/* <DummyText lang='en' length="s" lts={lts} className="-whs:nowrap -hl:xs" /> */}
        </Stack>
      );
    })}
  </Stack>
);

export const BoxShadowDemos = ({ shadows = [] }) => {
  return (
    <>
      {shadows.map((name) => {
        return (
          <Center key={name} h="100%" ar="1/1" bgc="base" bxsh={name} bdrs="10" ff="mono" fz="xs" c="text-2">
            {name}
          </Center>
        );
      })}
    </>
  );
};

export const SpacingDemos = ({ spaces }) => {
  return (
    <Stack g="5" hl="s">
      {spaces.map((s, i) => {
        return (
          <Stack key={s} g="5">
            <Box g="10" d="grid" gtc="1.5rem min-content">
              <Box bgc="base" fz="xs" ta="right">
                <code>{s}</code>
              </Box>
              <Box pl={s} h="1.25em" bgc="brand" bdrs="0 2px 2px 0"></Box>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};
