import { Box, Flex, Heading, Inline, Stack, Text } from 'lism-css/react';
import { Badge } from '@lism-css/ui/react/Badge';
import { tokenGroups, type ViewerToken } from 'virtual:lism-mockup/tokens';

/** Label of this view. Shared with the header, the nav and `document.title`. */
export const TOKENS_VIEW_LABEL = 'Design tokens';

/** Groups whose values are colors, so a swatch is worth showing. */
const COLOR_GROUPS = new Set(['color', 'palette']);

/** Short badge text for the tokens the mockup's `tokens.json` touched. */
const SOURCE_LABELS: Record<Exclude<ViewerToken['source'], 'default'>, string> = {
  overridden: 'override',
  custom: 'new',
};

/**
 * Lists every design token the viewer's CSS defines.
 *
 * The data comes from `virtual:lism-mockup/tokens`, which the CLI builds from the
 * very same merged config as the token CSS, so the list cannot drift from what
 * the pages actually use.
 */
export default function TokensView() {
  return (
    <Stack p="30" g="40">
      <Stack g="10">
        <Heading level="2" fz="l">
          {TOKENS_VIEW_LABEL}
        </Heading>
        <Text fz="s" c="text-2">
          Every token the viewer defines, including the ones this mockup overrides or adds in <Inline as="code">tokens.json</Inline>.
        </Text>
      </Stack>
      {tokenGroups.length === 0 ? (
        <Text fz="s" c="text-2">
          No tokens were found.
        </Text>
      ) : (
        tokenGroups.map((group) => (
          <Stack key={group.group} as="section" g="15">
            <Heading level="3" fz="xs" fw="bold" c="text-2" tt="upper" lts="l">
              {group.group}
            </Heading>
            <Stack as="ul" g="0">
              {group.tokens.map((token, index) => (
                <TokenRow key={token.key} token={token} showSwatch={COLOR_GROUPS.has(group.group)} hasDivider={index > 0} />
              ))}
            </Stack>
          </Stack>
        ))
      )}
    </Stack>
  );
}

interface TokenRowProps {
  token: ViewerToken;
  showSwatch: boolean;
  /** Rows are separated by a rule, which the first row of a group must not get. */
  hasDivider: boolean;
}

function TokenRow({ token, showSwatch, hasDivider }: TokenRowProps) {
  return (
    <Flex as="li" ai="center" g="15" fxw="wrap" py="10" bd-bs={hasDivider || undefined}>
      {showSwatch && (
        // The swatch reads the custom property instead of the raw value, so theme
        // overrides (e.g. the viewer's dark mode) are reflected here too.
        <Box aria-hidden="true" fxsh="0" w="1.5em" ar="1/1" bgc={`var(${token.varName})`} bd bdrs="10" />
      )}
      <Flex ai="baseline" g="10" fxw="wrap" min-w="0">
        <Inline fz="s" fw="bold" ovw="anywhere">
          {token.key}
        </Inline>
        <Inline as="code" fz="2xs" ff="mono" c="text-2" ovw="anywhere">
          {token.varName}
        </Inline>
      </Flex>
      <Inline fz="xs" ff="mono" fxg="1" min-w="0" ovw="anywhere">
        {token.value}
      </Inline>
      {token.source !== 'default' && (
        <Badge variant="outline" fz="2xs" fxsh="0">
          {SOURCE_LABELS[token.source]}
        </Badge>
      )}
    </Flex>
  );
}
