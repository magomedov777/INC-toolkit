import { UpdateDomainTaskModelType } from 'features/TodolistsList/tasks-slice'
import { TaskPriorities, TaskStatuses } from 'utils/enums'

export type AddTaskArgs = {
  title: string
  todolistId: string
}
export type UpdateTaskArgs = {
  taskId: string
  domainModel: UpdateDomainTaskModelType
  todolistId: string
}

export type TaskType = {
  description: string
  title: string
  status: TaskStatuses
  priority: TaskPriorities
  startDate: string
  deadline: string
  id: string
  todoListId: string
  order: number
  addedDate: string
}
export type UpdateTaskModelType = {
  title: string
  description: string
  status: TaskStatuses
  priority: TaskPriorities
  startDate: string
  deadline: string
}

export type GetTasksResponse = {
  error: string | null
  totalCount: number
  items: TaskType[]
}
