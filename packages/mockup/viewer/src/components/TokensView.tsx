import { Flex, Grid, Heading, Inline, Stack, Text } from 'lism-css/react';
import { Badge } from '@lism-css/ui/react/Badge';
import { tokenGroups, type ViewerToken } from 'virtual:lism-mockup/tokens';

import { useActiveSection } from '../lib/useActiveSection';
import TokenOutline, { type OutlineItem } from './TokenOutline';
import TokenPreview, { tokenGroupLayout } from './TokenPreview';

/** Label of this view. Shared with the header, the nav and `document.title`. */
export const TOKENS_VIEW_LABEL = 'Design tokens';

/** Short badge text for the tokens the mockup's `tokens.json` touched. */
const SOURCE_LABELS: Record<Exclude<ViewerToken['source'], 'default'>, string> = {
  overridden: 'override',
  custom: 'new',
};

/** DOM id of a group section: the outline's scroll target. */
const sectionId = (group: string) => `tokenGroup-${group}`;

/**
 * Column tracks of a group's rows.
 *
 * `TABLE` is preview / name / var name (+ badge) / value on one line.
 * `STACKED` is two rows — preview + name, then var name + value — so a narrow
 * viewport stays two lines instead of three. Which breakpoint swaps one for the
 * other depends on the group: a wide preview only leaves room for the full table
 * from `md`, everything else manages from `sm`. Responsive positions are
 * `[base, sm, md]`, so the wide variant skips `sm` with a `null`.
 *
 * Both layouts place the four cells in document order; no per-cell `gc` is
 * needed because the track count alone decides the wrap.
 */
const STACKED_COLUMNS = '1fr 1fr';
const TABLE_COLUMNS = 'minmax(max-content, 25%) auto minmax(max-content, 1fr) auto';

/**
 * Outline entries, one per group. Built once at module scope: `tokenGroups` is
 * a constant of the generated module, and `useActiveSection` needs a stable
 * array of ids.
 */
const OUTLINE_ITEMS: OutlineItem[] = tokenGroups.map((group) => ({ label: group.group, id: sectionId(group.group) }));
const SECTION_IDS = OUTLINE_ITEMS.map((item) => item.id);

/**
 * Lists every design token the viewer's CSS defines.
 *
 * The data comes from `virtual:lism-mockup/tokens`, which the CLI builds from the
 * very same merged config as the token CSS, so the list cannot drift from what
 * the pages actually use.
 */
export default function TokensView() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <>
      {/* `is--wrapper` keeps the rows at a readable measure (its default
          `--contentSize` is already `--sz--m`) instead of letting them stretch
          across a wide screen. The end padding is wider than the start one
          because that is where the floating outline sits. */}
      <Stack isWrapper py="30" ps="30" pe="50" g="40">
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
          tokenGroups.map((group) => <TokenGroupSection key={group.group} group={group.group} tokens={group.tokens} />)
        )}
      </Stack>
      <TokenOutline items={OUTLINE_ITEMS} activeId={activeId} />
    </>
  );
}

interface TokenGroupSectionProps {
  group: string;
  tokens: ViewerToken[];
}

function TokenGroupSection({ group, tokens }: TokenGroupSectionProps) {
  // A group whose preview needs the whole row needs the whole view with it, so
  // it opts out of the wrapper's content size instead of being centred in it.
  const { note, isBlock: isBlockPreview, isWide } = tokenGroupLayout(group);

  const rows = tokens.map((token, index) => (
    <TokenRow key={token.key} group={group} token={token} isBlockPreview={isBlockPreview} hasDivider={index > 0} />
  ));

  return (
    // The outline scrolls sections to the top edge, so they keep a little air
    // above them when it does.
    // `isContainer` is what makes the rows below responsive: `is--wrapper` caps
    // its children — this section — at `--sz--m`, so the section is exactly the
    // box the rows live in and its width is the one worth querying.
    <Stack
      as="section"
      id={sectionId(group)}
      isContainer
      max-sz={isBlockPreview ? 'full' : undefined}
      g="15"
      style={{ scrollMarginBlockStart: '1rem' }}
    >
      <Flex ai="baseline" g="10" fxw="wrap">
        <Heading level="3" fz="xs" fw="bold" c="text-2" tt="upper" lts="l">
          {group}
        </Heading>
        {note && (
          <Text fz="2xs" c="text-2">
            {note}
          </Text>
        )}
      </Flex>
      {isBlockPreview ? (
        <Stack as="ul" g="0">
          {rows}
        </Stack>
      ) : (
        // The columns are declared once here and every row inherits them through
        // `subgrid`, so a column ends up exactly as wide as the widest cell of
        // the group and no preview has to hard-code a width to line up.
        // The preview track is `minmax(0, auto)` rather than `auto` so a wide
        // preview — the `space` bars run to `--s80` — can give way instead of
        // pushing the row past the section.
        <Grid as="ul" gtc={isWide ? [STACKED_COLUMNS, null, TABLE_COLUMNS] : [STACKED_COLUMNS, TABLE_COLUMNS]} cg="25" hl="s">
          {rows}
        </Grid>
      )}
    </Stack>
  );
}

interface TokenRowProps {
  /** Decides which preview shape the row gets. */
  group: string;
  token: ViewerToken;
  /** Whether the preview takes a band under the row instead of a column beside it. */
  isBlockPreview: boolean;
  /** Rows are separated by a rule, which the first row of a group must not get. */
  hasDivider: boolean;
}

function TokenRow({ group, token, isBlockPreview, hasDivider }: TokenRowProps) {
  const preview = <TokenPreview group={group} tokenKey={token.key} varName={token.varName} />;

  // Both layouts below show the same cells, so each one is built once here and
  // only placed differently.
  // The badge names the token, not its value, so it rides along with the key
  // instead of taking a column of its own.
  const keyCell = (
    <Inline fz="s" fw="bold" ovw="anywhere" min-w="0">
      {token.key}
      {token.source !== 'default' && (
        <Badge util="cbox" keycolor={token.source === 'custom' ? 'orange' : 'blue'} fz="2xs" hl="0" fxsh="0" px="10" bdrs="99" ms="10">
          {SOURCE_LABELS[token.source]}
        </Badge>
      )}
    </Inline>
  );
  const varCell = (
    <Flex ai="baseline" g="10" fxw="wrap" min-w="0">
      <Inline as="code" fz="2xs" ff="mono" c="text-2" ovw="anywhere">
        {token.varName}
      </Inline>
    </Flex>
  );

  // A block preview is too wide to sit next to the text, so it takes a band of
  // its own under it instead of a column beside it. Its group has no preview
  // column to line up, so the row stays a plain wrapping flex, where the value
  // has to claim the leftover space itself — the grid layout below gets that
  // from its track instead.
  if (isBlockPreview) {
    return (
      <Stack as="li" g="10" py="10" bd-bs={hasDivider || undefined}>
        <Flex ai="center" g="25" fxw="wrap">
          {keyCell}
          {varCell}
          <Inline fz="xs" ff="mono" fxg="1" min-w="0" ovw="anywhere">
            {token.value}
          </Inline>
        </Flex>
        {preview}
      </Stack>
    );
  }

  return (
    // `subgrid` takes the columns from the `ul`, so the cells line up with every
    // other row without knowing anything about their own width. The gap repeats
    // the one the `ul` sets, and adds the row gap the narrow layout needs.
    // Cells stay in source order: two tracks stack them into two rows, four
    // tracks line them up as a table.
    <Grid as="li" gtc="subgrid" gc="1/-1" ai="center" g="25" rg="10" py="15" bd-bs={hasDivider || undefined}>
      {preview}
      {keyCell}
      {varCell}
      <Inline fz="xs" ff="mono" ovw="anywhere">
        {token.value}
      </Inline>
    </Grid>
  );
}
