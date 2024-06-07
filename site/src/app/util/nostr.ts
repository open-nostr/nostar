
import { Event } from 'nostr-tools';
import { timeOfNow } from './util';

export type Tag = string[];
export type Tags = Tag[];
export class BaseEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: Tags;
    content: string;
    sig: string;

    /**
     * create a new empty `BaseEvent` when argument is undefined,
     * create `BaseEvent` from existing `Event` json object when argument not null.
     * throw `Error` if argument is invalid, e.g.: signature invalid
     * @param event optional `nostr-tools` event object
     */
    constructor(event?: Event) {
        if (event && event.sig) {
            // if (!validate(event)) {
            //   throw new Error('[new BaseEvent] parameter error!');
            // }
            this.id = event.id;
            this.pubkey = event.pubkey;
            this.created_at = event.created_at;
            this.kind = event.kind;
            this.tags = event.tags;
            this.content = event.content;
            this.sig = event.sig;
        } else {
            this.id = event?.id || '';
            this.pubkey = event?.pubkey || '';
            this.created_at = event?.created_at || timeOfNow();
            this.kind = event?.kind ?? -1;
            this.tags = event?.tags || [];
            this.content = event?.content || '';
            this.sig = event?.sig || '';
        }
    }
}
