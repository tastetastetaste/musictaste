import { BeforeInsert, PrimaryColumn } from 'typeorm';
import { genId } from '../../src/common/genId';

export abstract class SharedBaseEntity {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  beforeInsert() {
    this.id = genId();
  }
}
