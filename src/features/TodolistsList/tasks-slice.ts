/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  TodolistType,
  UpdateTaskModelType,
} from '../../api/todolists-api'
import { Dispatch } from 'redux'
import { AppDispatch, AppRootStateType, AppThunk } from '../../app/store'
import { handleServerAppError, handleServerNetworkError } from '../../utils/error-utils'
import { appActions } from 'app/app-slice'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { todolistsActions } from './todolists-slice'
import { createAppAsyncThunk } from 'utils/create-app-async-thunk'

const slice = createSlice({
  name: 'tasks',
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) tasks.splice(index, 1)
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      const tasks = state[action.payload.task.todoListId]
      tasks.unshift(action.payload.task)
    },
    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string
        model: UpdateDomainTaskModelType
        todolistId: string
      }>
    ) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...action.payload.model }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((el) => {
          state[el.id] = []
        })
      })
  },
})

export const updateTaskAC = (
  taskId: string,
  model: UpdateDomainTaskModelType,
  todolistId: string
) => ({ type: 'UPDATE-TASK', model, todolistId, taskId } as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
  ({ type: 'SET-TASKS', tasks, todolistId } as const)

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  `${slice.name}/fetchTasks`,
  async (todolistId, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { tasks, todolistId }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>(
  `${slice.name}/removeTask`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
      return arg
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
  todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
    dispatch(tasksActions.removeTask({ taskId, todolistId }))
  })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
  dispatch(appActions.setAppStatus({ status: 'loading' }))
  todolistsAPI
    .createTask(todolistId, title)
    .then((res) => {
      if (res.data.resultCode === 0) {
        const task = res.data.data.item
        dispatch(tasksActions.addTask({ task }))
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      } else {
        handleServerAppError(res.data, dispatch)
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
  (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find((t) => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    }

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(tasksActions.updateTask({ taskId, model: domainModel, todolistId }))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }

export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

export type RemoveTaskArgType = {
  todolistId: string
  taskId: string
}

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = { fetchTasks }
