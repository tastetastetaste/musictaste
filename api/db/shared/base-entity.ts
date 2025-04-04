import { nanoid } from 'nanoid';
import { BeforeInsert, PrimaryColumn } from 'typeorm';

export abstract class SharedBaseEntity {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  beforeInsert() {
    this.id = nanoid(12);
  }
}
