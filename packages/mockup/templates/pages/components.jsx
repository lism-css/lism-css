/**
 * Sample page — page id: "components".
 *
 * A hand maintained index of the UI parts this mockup uses. The viewer lists pages
 * and design tokens on its own, but it cannot know which parts a mockup settled on,
 * so keep this page in sync yourself: when a screen introduces a shared part, add
 * it here too.
 *
 * "components" is the one page id the viewer treats specially: it is listed as
 * "UI Parts" with the viewer's own screens and left out of the gallery, because it
 * documents the mockup instead of being one of its screens. Its name and its place
 * are fixed by the viewer, so `mockup.config.json` says nothing about this page.
 * Delete the file if a mockup does not need the list; renaming it turns it back into
 * an ordinary page.
 */
import { Cluster, Columns, Group, Heading, Icon, Inline, Link, List, Stack, Text, Wrapper } from 'lism-css/react';
import { Alert } from '@lism-css/ui/react/Alert';
import { Badge } from '@lism-css/ui/react/Badge';
import { Button } from '@lism-css/ui/react/Button';
import { Callout } from '@lism-css/ui/react/Callout';
import { Bell, Layers, Save, TrendingUp, Users } from 'lucide-react';

const statuses = [
  { label: 'Paid', color: 'success' },
  { label: 'Pending', color: 'orange' },
  { label: 'Refunded', color: 'text-2' },
];

const orders = [
  { id: '#10241', total: '$248.00' },
  { id: '#10240', total: '$1,120.00' },
];

function Section({ title, children }) {
  return (
    <Stack as="section" g="20">
      <Heading level="2" fz="l">
        {title}
      </Heading>
      <Stack g="30" p="30" bgc="base" bd bdrs="20">
        {children}
      </Stack>
    </Stack>
  );
}

function Sample({ label, children }) {
  return (
    <Stack g="10">
      <Text fz="xs" fw="bold" c="text-2" tt="upper" lts="l">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

export default function ComponentsPage() {
  return (
    <Group isContainer hasGutter py="40">
      <Wrapper contentSize="l">
        <Stack g="50">
          <Stack g="10">
            <Heading level="1" fz="2xl">
              UI Parts
            </Heading>
            <Text fz="s" c="text-2">
              The parts used across the Acme Console screens. Reuse them instead of inventing a new variant.
            </Text>
          </Stack>

          <Section title="Buttons and links">
            <Sample label="Fill / outline / with icon / text link">
              <Cluster g="15" ai="center">
                <Button variant="fill" keycolor="brand" href="#">
                  Get started
                </Button>
                <Button variant="outline" href="#">
                  See features
                </Button>
                <Button as="button" type="button" variant="fill" keycolor="brand" g="10" ai="center">
                  <Icon as={Save} />
                  Save changes
                </Button>
                <Link href="#">Read the docs</Link>
              </Cluster>
            </Sample>
          </Section>

          <Section title="Badges and status">
            <Sample label="Badge / status text">
              <Cluster g="20" ai="center" fz="s">
                <Badge keycolor="brand">Design mockup</Badge>
                <Badge keycolor="success">All systems normal</Badge>
                {statuses.map(({ label, color }) => (
                  <Text as="div" key={label} c={color}>
                    {label}
                  </Text>
                ))}
              </Cluster>
            </Sample>
          </Section>

          <Section title="Notices">
            <Sample label="Alert / Callout">
              <Stack g="15">
                <Alert type="info">This screen uses sample data. Nothing here talks to an API.</Alert>
                <Callout type="note" title="Mockup only">
                  Saving updates local component state so the screen can be reviewed.
                </Callout>
              </Stack>
            </Sample>
          </Section>

          <Section title="Form controls">
            <Sample label="Text field">
              <Stack g="10">
                <Inline as="label" htmlFor="sampleName" className="c--fieldLabel" fw="bold" fz="s">
                  Workspace name
                </Inline>
                <input id="sampleName" name="sampleName" type="text" defaultValue="Acme" className="-w:100% -p:15 -bd -bdrs:10 -bgc:base" />
              </Stack>
            </Sample>
            <Sample label="Toggle row">
              <Cluster as="label" jc="between" g="20" p="20" bd bdrs="20">
                <Cluster g="15">
                  <Icon as={Bell} fz="l" c="text-2" />
                  <Text as="div" fw="bold" fz="s">
                    Email notifications
                  </Text>
                </Cluster>
                <input type="checkbox" name="sampleNotify" defaultChecked />
              </Cluster>
            </Sample>
          </Section>

          <Section title="Cards and lists">
            <Sample label="Stat card / feature card">
              <Columns cols={[1, null, 2]} g="20">
                <Stack className="c--statCard" g="15" p="25" bgc="base" bd bdrs="20">
                  <Cluster g="10" c="text-2" fz="s">
                    <Icon as={Users} fz="l" />
                    Active users
                  </Cluster>
                  <Cluster jc="between" g="10" ai="end">
                    <Text as="div" fz="2xl" fw="bold">
                      8,412
                    </Text>
                    <Cluster g="5" fz="xs" c="success">
                      <Icon as={TrendingUp} />
                      +12.4%
                    </Cluster>
                  </Cluster>
                </Stack>
                <Stack className="c--featureCard" g="15" p="30" bgc="base-2" bdrs="20">
                  <Icon as={Layers} fz="2xl" c="brand" />
                  <Heading level="3" fz="l">
                    Layout first
                  </Heading>
                  <Text fz="s" c="text-2">
                    Primitives describe the skeleton of a screen.
                  </Text>
                </Stack>
              </Columns>
            </Sample>
            <Sample label="Divided list">
              <List layout="stack" g="15" fz="s">
                {orders.map(({ id, total }, i) => (
                  <Cluster as="li" key={id} jc="between" g="15" bd-bs={i > 0} pbs={i > 0 ? '15' : undefined}>
                    <Text as="div" ff="mono" c="text-2">
                      {id}
                    </Text>
                    <Text as="div" fw="bold">
                      {total}
                    </Text>
                  </Cluster>
                ))}
              </List>
            </Sample>
          </Section>
        </Stack>
      </Wrapper>
    </Group>
  );
}
