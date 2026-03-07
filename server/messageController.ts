import { Request, Response } from "express";
import { MessageService } from "./messageService";
import { Database } from "better-sqlite3";

export class MessageController {
  private service: MessageService;

  constructor(db: Database) {
    this.service = new MessageService(db);
  }

  add = (req: Request, res: Response) => {
    const newMessage = this.service.addMessage(req.params.id, req.body);
    res.json(newMessage);
  };
}
