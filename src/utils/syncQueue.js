// Minimal offline sync queue processor with Hub integration
import { outboxList, outboxDelete } from './storage';
import { HubClient, mergeWithoutOverwrite } from './hubClient';
import { idbGet, idbSet } from './storage';

export async function processOutbox() {
  // Iterate, POST/PATCH to The Hub, handle etags and conflicts
  const items = await outboxList();
  for (const item of items) {
    try {
      switch (item.type) {
        case 'invite': {
          // item.payload: { toContactId, fromProfileId, shareMatrix }
          await HubClient.createInvitation(item.payload);
          break;
        }
        case 'contact-merge': {
          // item.payload: { ownerProfileId, contact }
          const { ownerProfileId, contact } = item.payload || {};
          if (!ownerProfileId || !contact?.id) break;
          // Try PATCH with etag if provided, else create
          try {
            const etag = contact._etag;
            await HubClient.patchContact(ownerProfileId, contact.id, contact, etag);
          } catch (e) {
            if (e.status === 412) {
              // Precondition failed: fetch latest and merge without overwrite, then retry
              const remote = await HubClient.getProfile(ownerProfileId).catch(()=>null);
              // Optionally fetch contact directly if endpoint exists; here we fallback to remote profile.contacts
              const remoteContact = remote?.data?.contacts?.find?.(c => c.id === contact.id);
              const merged = mergeWithoutOverwrite(contact, remoteContact || {});
              await HubClient.patchContact(ownerProfileId, contact.id, merged, remote?.etag || undefined);
            } else if (e.status === 404) {
              await HubClient.createContact(ownerProfileId, contact);
            } else {
              throw e;
            }
          }
          // Optionally persist merged contact locally
          const contacts = (await idbGet('contacts')) || [];
          const idx = contacts.findIndex(c => c.id === contact.id);
          if (idx >= 0) contacts[idx] = { ...contacts[idx], ...contact };
          else contacts.push(contact);
          await idbSet('contacts', contacts);
          break;
        }
        default:
          break;
      }
      await outboxDelete(item.id);
    } catch (e) {
      // Leave in queue to retry later
    }
  }
}
