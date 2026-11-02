import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Profile } from './profile.entity.js';


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar'})
    name: string;

    @Column({ type: 'varchar'})
    email: string;

    @OneToOne(() => Profile, {cascade:true})
    @JoinColumn({name:'profile_id'})
    profile: Profile;

    @Column({ type: 'varchar'})
    password: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
