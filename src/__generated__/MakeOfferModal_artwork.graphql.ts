/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type MakeOfferModal_artwork = {
    readonly " $fragmentRefs": FragmentRefs<"CollapsibleArtworkDetails_artwork" | "MakeOfferButton_artwork">;
    readonly " $refType": "MakeOfferModal_artwork";
};
export type MakeOfferModal_artwork$data = MakeOfferModal_artwork;
export type MakeOfferModal_artwork$key = {
    readonly " $data"?: MakeOfferModal_artwork$data;
    readonly " $fragmentRefs": FragmentRefs<"MakeOfferModal_artwork">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MakeOfferModal_artwork",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "CollapsibleArtworkDetails_artwork"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MakeOfferButton_artwork"
    }
  ],
  "type": "Artwork",
  "abstractKey": null
};
(node as any).hash = '2a880f80c8aa3b9a4b8a913bbce52b20';
export default node;
