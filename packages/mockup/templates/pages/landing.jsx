/**
 * Sample page — page id: "landing" (path under `pages/` without the extension).
 *
 * What to copy from this file:
 * - Structure comes from Lism primitives (`Group` / `Wrapper` / `Stack` / `Cluster`
 *   / `Columns`), never from bare `<div>` + hand written CSS.
 * - Spacing / colors / font sizes are design tokens passed as props
 *   (`py="50"`, `g="30"`, `fz="2xl"`, `c="text-2"`), never raw px values.
 * - Responsive values are arrays (`[base, sm, md]`) and need an `isContainer`
 *   ancestor, which the page root declares.
 */
import { Cluster, Columns, Group, Heading, Icon, Link, List, Stack, Text, Wrapper } from 'lism-css/react';
import { Badge } from '@lism-css/ui/react/Badge';
import { Button } from '@lism-css/ui/react/Button';
import { Check, Gauge, Layers, Palette } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Layout first',
    body: 'Stack, Cluster and Columns describe the skeleton of a screen, so a mockup reads like the markup you will ship.',
  },
  {
    icon: Palette,
    title: 'Tokens everywhere',
    body: 'Spacing, colors and font sizes come from one scale. Change tokens.json and every screen follows.',
  },
  {
    icon: Gauge,
    title: 'No build setup',
    body: 'The preview viewer ships with the CLI. Write data files only — pages, tokens and a small config.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    featured: false,
    items: ['3 projects', 'Community support', 'Basic analytics'],
  },
  {
    name: 'Team',
    price: '$29',
    featured: true,
    items: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'Shared design tokens'],
  },
];

export default function LandingPage() {
  return (
    <Group isContainer>
      <Group as="header" className="c--siteHeader" py="20" hasGutter bd-be>
        <Wrapper contentSize="xl">
          <Cluster jc="between" g="20">
            <Link href="#hero" fw="bold" fz="l" c="text" td="none">
              Acme
            </Link>
            <Cluster as="nav" g="30" fz="s">
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
            </Cluster>
          </Cluster>
        </Wrapper>
      </Group>

      {/* `bgc="canvas"` uses a color key added in tokens.json.
          New color keys have no Property Class, so they must be passed as props
          (or referenced as `var(--canvas)` in CSS) — never as `-bgc:canvas`. */}
      <Group as="section" id="hero" className="landingHero" bgc="canvas" py={['50', null, '70']} hasGutter>
        <Wrapper contentSize="m">
          <Stack g="30" ai="center" ta="center">
            <Badge keycolor="brand">Design mockup</Badge>
            <Heading level="1" fz={['3xl', null, '5xl']} hl="xs">
              Ship the layout before the code
            </Heading>
            <Text fz={['m', null, 'l']} c="text-2">
              Sketch every screen with the same primitives and tokens your production app uses, then hand the mockup over as the implementation
              baseline.
            </Text>
            <Cluster g="15" jc="center">
              <Button variant="fill" keycolor="brand" href="#pricing">
                Get started
              </Button>
              <Button variant="outline" href="#features">
                See features
              </Button>
            </Cluster>
          </Stack>
        </Wrapper>
      </Group>

      <Group as="section" id="features" className="landingFeatures" py={['50', null, '70']} hasGutter>
        <Wrapper contentSize="l">
          <Stack g="40">
            <Stack g="15" ta="center">
              <Heading level="2" fz="2xl">
                Everything is a primitive
              </Heading>
              <Text c="text-2">Three building blocks cover most screens.</Text>
            </Stack>
            <Columns cols={[1, null, 3]} g="30">
              {features.map(({ icon, title, body }) => (
                <Stack key={title} className="c--featureCard" g="15" p="30" bgc="base-2" bdrs="20">
                  <Icon as={icon} fz="2xl" c="brand" />
                  <Heading level="3" fz="l">
                    {title}
                  </Heading>
                  <Text fz="s" c="text-2">
                    {body}
                  </Text>
                </Stack>
              ))}
            </Columns>
          </Stack>
        </Wrapper>
      </Group>

      <Group as="section" id="pricing" className="landingPricing" bgc="base-2" py={['50', null, '70']} hasGutter>
        <Wrapper contentSize="m">
          <Stack g="40">
            <Heading level="2" fz="2xl" ta="center">
              Simple pricing
            </Heading>
            <Columns cols={[1, null, 2]} g="30">
              {plans.map(({ name, price, featured, items }) => (
                <Stack key={name} className="c--planCard" g="25" p="30" bgc="base" bdrs="20" bxsh="10">
                  <Stack g="5">
                    <Text fz="xs" fw="bold" c="text-2" tt="upper" lts="l">
                      {name}
                    </Text>
                    <Cluster g="5" ai="end">
                      <Text as="div" fz="3xl" fw="bold">
                        {price}
                      </Text>
                      <Text fz="s" c="text-2">
                        / month
                      </Text>
                    </Cluster>
                  </Stack>
                  <List layout="stack" g="10" fz="s">
                    {items.map((item) => (
                      <Cluster as="li" key={item} g="10">
                        <Icon as={Check} c="success" />
                        {item}
                      </Cluster>
                    ))}
                  </List>
                  <Button variant={featured ? 'fill' : 'outline'} keycolor="brand" href="#hero">
                    Choose {name}
                  </Button>
                </Stack>
              ))}
            </Columns>
          </Stack>
        </Wrapper>
      </Group>

      <Group as="footer" className="c--siteFooter" py="40" hasGutter bd-bs>
        <Wrapper contentSize="xl">
          <Cluster jc="between" g="20" fz="s" c="text-2">
            <Text>© 2026 Acme</Text>
            <Cluster as="nav" g="20">
              <Link href="#hero">Privacy</Link>
              <Link href="#hero">Terms</Link>
            </Cluster>
          </Cluster>
        </Wrapper>
      </Group>
    </Group>
  );
}
