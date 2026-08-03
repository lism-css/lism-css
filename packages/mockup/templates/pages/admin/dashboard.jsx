/**
 * Sample page — page id: "admin/dashboard".
 *
 * Sub-directories under `pages/` become part of the page id, so this file is
 * addressed as `admin/dashboard` in `mockup.config.json` and in the viewer URL.
 *
 * Notice that no CSS file is needed for this screen: card padding, radius,
 * shadow and colors are all Property Class props on the primitives.
 */
import { Cluster, Columns, Group, Heading, Icon, List, Stack, Text, Wrapper } from 'lism-css/react';
import { Alert } from '@lism-css/ui/react/Alert';
import { Badge } from '@lism-css/ui/react/Badge';
import { CreditCard, Gauge, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Active users', value: '8,412', delta: '+12.4%', up: true },
  { icon: ShoppingCart, label: 'Orders', value: '1,208', delta: '+3.1%', up: true },
  { icon: CreditCard, label: 'Revenue', value: '$94,320', delta: '-1.8%', up: false },
  { icon: Gauge, label: 'Avg. response', value: '182 ms', delta: '-6.0%', up: true },
];

const orders = [
  { id: '#10241', customer: 'Iris Watanabe', total: '$248.00', status: 'Paid' },
  { id: '#10240', customer: 'Ben Alvarez', total: '$1,120.00', status: 'Pending' },
  { id: '#10239', customer: 'Mika Larsen', total: '$76.50', status: 'Paid' },
  { id: '#10238', customer: 'Theo Nakamura', total: '$399.00', status: 'Refunded' },
];

const statusColor = { Paid: 'success', Pending: 'orange', Refunded: 'text-2' };

export default function DashboardPage() {
  return (
    <Group isContainer hasGutter py="40">
      <Wrapper contentSize="xl">
        <Stack g="40">
          <Cluster jc="between" g="20">
            <Stack g="5">
              <Heading level="1" fz="2xl">
                Dashboard
              </Heading>
              <Text fz="s" c="text-2">
                Last updated 5 minutes ago
              </Text>
            </Stack>
            {/* `keycolor` accepts the "success" key added in tokens.json. */}
            <Badge keycolor="success">All systems normal</Badge>
          </Cluster>

          <Alert type="info">This screen uses sample data. Nothing here talks to an API.</Alert>

          <Columns cols={[1, 2, 4]} g="20">
            {stats.map(({ icon, label, value, delta, up }) => (
              <Stack key={label} className="c--statCard" g="15" p="25" bgc="base" bd bdrs="20">
                <Cluster g="10" c="text-2" fz="s">
                  <Icon as={icon} fz="l" />
                  {label}
                </Cluster>
                <Cluster jc="between" g="10" ai="end">
                  <Text as="div" fz="2xl" fw="bold">
                    {value}
                  </Text>
                  <Cluster g="5" fz="xs" c={up ? 'success' : 'accent'}>
                    <Icon as={up ? TrendingUp : TrendingDown} />
                    {delta}
                  </Cluster>
                </Cluster>
              </Stack>
            ))}
          </Columns>

          <Group as="section" bgc="base" bd bdrs="20" p="30">
            <Stack g="25">
              <Heading level="2" fz="l">
                Recent orders
              </Heading>
              <List layout="stack" util="divide" g="15" fz="s">
                {orders.map(({ id, customer, total, status }) => (
                  <Cluster as="li" key={id} jc="between" g="15">
                    <Cluster g="15">
                      <Text as="div" ff="mono" c="text-2">
                        {id}
                      </Text>
                      <Text as="div">{customer}</Text>
                    </Cluster>
                    <Cluster g="20">
                      <Text as="div" fw="bold">
                        {total}
                      </Text>
                      <Text as="div" c={statusColor[status]}>
                        {status}
                      </Text>
                    </Cluster>
                  </Cluster>
                ))}
              </List>
            </Stack>
          </Group>
        </Stack>
      </Wrapper>
    </Group>
  );
}
