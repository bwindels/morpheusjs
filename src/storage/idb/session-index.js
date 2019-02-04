import {openDatabase, select} from "./utils";

function createSessionsStore(db) {
	db.createObjectStore("sessions", "id");
}

function createStores(db) {
	db.createObjectStore("sync");	//sync token 
	db.createObjectStore("summary", "room_id", {unique: true});
	const timeline = db.createObjectStore("timeline", ["room_id", "sort_key"]);
	timeline.createIndex("by_event_id", ["room_id", "event.event_id"], {unique: true});
	// how to get the first/last x events for a room?
	// we don't want to specify the sort key, but would need an index for the room_id?
	// take sort_key as primary key then and have index on event_id?
	// still, you also can't have a PK of [room_id, sort_key] and get the last or first events with just the room_id? the only thing that changes it that the PK will provide an inherent sorting that you inherit in an index that only has room_id as keyPath??? There must be a better way, need to write a prototype test for this.
	// SOLUTION: with numeric keys, you can just us a min/max value to get first/last
	// db.createObjectStore("members", ["room_id", "state_key"]);
	const state = db.createObjectStore("state", ["event.room_id", "event.type", "event.state_key"]);
}

class Sessions {

	constructor(databaseName, idToSessionDbName) {
		this._databaseName = databaseName;
		this._idToSessionDbName = idToSessionDbName;
	}

	async getSessions(sessionsDbName) {
		const db = await openDatabase(this._databaseName, db => createSessionsStore(db));
		const sessions = await select(db, "sessions");
		db.close();
		return sessions;
	}

	async openSessionStore(session) {
		const db = await openDatabase(this._idToSessionDbName(session.id), db => createStores(db));
		return new SessionStore(db);
	}
}