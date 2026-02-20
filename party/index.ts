import type * as Party from "partykit/server";

export default class SwordRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string) {
    this.room.broadcast(message);
  }

  onConnect(conn: Party.Connection) {
    console.log(`[${this.room.id}] connected: ${conn.id}`);
  }
}