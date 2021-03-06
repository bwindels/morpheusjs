/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {Storage} from "./Storage.js";
import { openDatabase, reqAsPromise } from "./utils.js";
import { exportSession, importSession } from "./export.js";

const sessionName = sessionId => `brawl_session_${sessionId}`;
const openDatabaseWithSessionId = sessionId => openDatabase(sessionName(sessionId), createStores, 1);

export class StorageFactory {
    async create(sessionId) {
        const db = await openDatabaseWithSessionId(sessionId);
        return new Storage(db);
    }

    delete(sessionId) {
        const databaseName = sessionName(sessionId);
        const req = window.indexedDB.deleteDatabase(databaseName);
        return reqAsPromise(req);
    }

    async export(sessionId) {
        const db = await openDatabaseWithSessionId(sessionId);
        return await exportSession(db);
    }

    async import(sessionId, data) {
        const db = await openDatabaseWithSessionId(sessionId);
        return await importSession(db, data);
    }
}

function createStores(db) {
    db.createObjectStore("session", {keyPath: "key"});
    // any way to make keys unique here? (just use put?)
    db.createObjectStore("roomSummary", {keyPath: "roomId"});

    // need index to find live fragment? prooobably ok without for now
    //key = room_id | fragment_id
    db.createObjectStore("timelineFragments", {keyPath: "key"});
    //key = room_id | fragment_id | event_index
    const timelineEvents = db.createObjectStore("timelineEvents", {keyPath: "key"});
    //eventIdKey = room_id | event_id
    timelineEvents.createIndex("byEventId", "eventIdKey", {unique: true});
    //key = room_id | event.type | event.state_key,
    db.createObjectStore("roomState", {keyPath: "key"});
    db.createObjectStore("pendingEvents", {keyPath: "key"});
    
    // const roomMembers = db.createObjectStore("roomMembers", {keyPath: [
    //  "event.room_id",
    //  "event.content.membership",
    //  "event.state_key"
    // ]});
    // roomMembers.createIndex("byName", ["room_id", "content.name"]);
}
