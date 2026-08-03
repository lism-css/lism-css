/**
 * Sample page — page id: "admin/settings".
 *
 * Shows the two things the other sample pages do not:
 * - local state with `useState` (allowed: local UI state only — no API calls,
 *   no auth, no persistence, no business logic)
 * - a page-scoped CSS file imported with a relative path (`./settings.css`).
 *   Relative imports must stay inside the data directory.
 */
import { useState } from 'react';
import { Cluster, Group, Heading, Icon, Inline, Stack, Text, Wrapper } from 'lism-css/react';
import { Button } from '@lism-css/ui/react/Button';
import { Callout } from '@lism-css/ui/react/Callout';
import { Bell, Save } from 'lucide-react';

import './settings.css';

export default function SettingsPage() {
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Group isContainer hasGutter py="40">
      <Wrapper contentSize="s">
        <Stack g="40">
          <Stack g="10">
            <Heading level="1" fz="2xl">
              Settings
            </Heading>
            <Text fz="s" c="text-2">
              Workspace preferences for the Acme console.
            </Text>
          </Stack>

          <Callout type="note" title="Mock only">
            Saving updates local component state so the screen can be reviewed. No request is sent anywhere.
          </Callout>

          <Stack as="form" g="30" onSubmit={handleSubmit}>
            <Stack g="10">
              <Inline as="label" htmlFor="workspaceName" className="c--fieldLabel" fw="bold" fz="s" data-required>
                Workspace name
              </Inline>
              <input id="workspaceName" name="workspaceName" type="text" defaultValue="Acme" className="-w:100% -p:15 -bd -bdrs:10 -bgc:base" />
              <Text fz="xs" c="text-2">
                Shown in the top-left of every admin screen.
              </Text>
            </Stack>

            <Stack g="10">
              <Inline as="label" htmlFor="contactEmail" className="c--fieldLabel" fw="bold" fz="s">
                Contact email
              </Inline>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue="team@example.com"
                className="-w:100% -p:15 -bd -bdrs:10 -bgc:base"
              />
            </Stack>

            <Cluster as="label" jc="between" g="20" p="20" bd bdrs="20">
              <Cluster g="15">
                <Icon as={Bell} fz="l" c="text-2" />
                <Stack g="5">
                  <Text as="div" fw="bold" fz="s">
                    Email notifications
                  </Text>
                  <Text fz="xs" c="text-2">
                    Send a digest when a deploy finishes.
                  </Text>
                </Stack>
              </Cluster>
              <input type="checkbox" name="notify" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
            </Cluster>

            <Cluster jc="between" g="20">
              <Cluster as="p" className="c--saveStatus" g="10" fz="s" c="text-2" data-state={saved ? 'saved' : 'idle'}>
                {saved ? 'Changes saved' : 'Unsaved changes'}
              </Cluster>
              <Button as="button" type="submit" variant="fill" keycolor="brand" g="10" ai="center">
                <Icon as={Save} />
                Save changes
              </Button>
            </Cluster>
          </Stack>
        </Stack>
      </Wrapper>
    </Group>
  );
}
