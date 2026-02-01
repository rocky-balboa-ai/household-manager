import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, CompleteTaskDto } from './dto/update-task.dto';
import { TaskStatus } from 'database';

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(userId?: string, role?: string) {
    const where: any = {};
    if (role && !['ADMIN', 'MANAGER'].includes(role)) {
      where.assignments = { some: { userId } };
    }
    return this.db.task.findMany({
      where,
      include: {
        assignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        assignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, createdById: string) {
    return this.db.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        recurring: dto.recurring,
        createdById,
        assignments: { create: dto.assigneeIds.map((userId) => ({ userId })) },
      },
      include: { assignments: { include: { user: { select: { id: true, name: true, role: true } } } } },
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (dto.assigneeIds) {
      await this.db.taskAssignment.deleteMany({ where: { taskId: id } });
      await this.db.taskAssignment.createMany({ data: dto.assigneeIds.map((userId) => ({ taskId: id, userId })) });
    }
    const { assigneeIds, status, ...updateData } = dto;
    return this.db.task.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: status ? (status as TaskStatus) : undefined,
      },
      include: { assignments: { include: { user: { select: { id: true, name: true, role: true } } } } },
    });
  }

  async complete(id: string, dto: CompleteTaskDto, userId: string) {
    const task = await this.db.task.findUnique({ where: { id }, include: { assignments: true } });
    if (!task) throw new NotFoundException('Task not found');
    const isAssigned = task.assignments.some((a) => a.userId === userId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this task');
    return this.db.task.update({
      where: { id },
      data: { status: TaskStatus.COMPLETED, completedAt: new Date(), photoProof: dto.photoProof },
      include: { assignments: { include: { user: { select: { id: true, name: true, role: true } } } } },
    });
  }

  async delete(id: string) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.db.task.delete({ where: { id } });
    return { success: true };
  }
}
